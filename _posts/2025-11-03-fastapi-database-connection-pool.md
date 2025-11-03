---
layout: post
title:  "FastAPI: 고성능을 위한 데이터베이스 커넥션 풀 완벽 가이드"
date:   2025-11-03 00:00:00 +0900
categories: python fastapi database
---

## 들어가며

현대의 웹 애플리케이션, 특히 FastAPI와 같이 높은 처리량을 목표로 하는 비동기 프레임워크에서 데이터베이스 연동은 성능의 핵심 요소입니다. 사용자의 요청이 들어올 때마다 데이터베이스 연결을 새로 만들고 닫는 방식은 애플리케이션에 심각한 병목을 유발할 수 있습니다. 이 문제를 해결하는 가장 효율적인 방법은 **데이터베이스 커넥션 풀(Database Connection Pool)**을 사용하는 것입니다.

이 글에서는 FastAPI 환경에서 데이터베이스의 부하를 줄이고 애플리케이션의 응답 속도와 안정성을 극대화하기 위해 커넥션 풀을 어떻게 만들고 관리하는지 3페이지에 걸쳐 상세히 설명하겠습니다.

---

## 1페이지: 커넥션 풀, 왜 반드시 사용해야 하는가?

### 커넥션 풀이란 무엇인가?

커넥션 풀은 미리 일정 개수의 데이터베이스 연결(Connection)을 생성하여 풀(Pool)에 저장해두고, 필요할 때마다 가져다 쓰고 다시 반납하는 기술입니다. 매번 연결을 새로 만드는 대신 기존 연결을 재사용함으로써 얻는 이점은 명확합니다.

- **성능 향상**: 데이터베이스 연결은 TCP/IP 핸드셰이크, 인증, 세션 설정 등 비용이 많이 드는 작업입니다. 커넥션 풀은 이 비용을 애플리케이션 시작 시 또는 필요할 때 소수만 지불하도록 하여 개별 요청의 응답 시간을 크게 단축합니다.
- **자원 효율성**: 데이터베이스 서버가 동시에 처리할 수 있는 연결의 수는 제한적입니다. 만약 모든 요청이 개별적인 연결을 생성한다면, 동시 접속자가 몰릴 경우 데이터베이스는 연결 한도를 초과하여 새로운 요청을 거부하게 됩니다. 커넥션 풀은 생성될 수 있는 총 연결 수를 제어하여 데이터베이스 서버를 보호하고 자원을 효율적으로 사용합니다.
- **안정성 증가**: 연결 생성 및 해제 과정에서 발생할 수 있는 네트워크 오류나 지연으로부터 애플리케이션을 더 안정적으로 만듭니다. 풀은 유휴 연결을 관리하고, 비정상적인 연결을 감지하여 교체하는 메커니즘도 제공합니다.

간단히 비유하자면, 매번 택시를 부르고 기다리는 대신, 필요할 때 즉시 사용할 수 있도록 대기 중인 택시 정류장을 운영하는 것과 같습니다.

---

## 2페이지: FastAPI와 SQLAlchemy로 커넥션 풀 구축하기

FastAPI에서 커넥션 풀을 구현하는 가장 일반적이고 강력한 방법은 **SQLAlchemy**와 비동기 데이터베이스 드라이버를 함께 사용하는 것입니다. 여기서는 PostgreSQL을 위한 비동기 드라이버인 `asyncpg`를 예시로 사용하겠습니다.

### 1. 필요 라이브러리 설치

먼저 필요한 라이브러리를 설치합니다.

```bash
pip install "sqlalchemy[asyncio]" "asyncpg" "fastapi" "uvicorn"
```

- `sqlalchemy[asyncio]`: SQLAlchemy의 비동기 지원 기능을 활성화합니다.
- `asyncpg`: PostgreSQL을 위한 고성능 비동기 드라이버입니다.

### 2. 데이터베이스 설정 및 커넥션 풀 생성

이제 커넥션 풀을 포함하는 SQLAlchemy의 `AsyncEngine`을 생성합니다. 이 설정은 보통 `database.py`와 같은 별도의 설정 파일에 위치시킵니다.

**`database.py`**
```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# 1. 데이터베이스 접속 정보
# postgresql+asyncpg://{user}:{password}@{host}:{port}/{database_name}
DATABASE_URL = "postgresql+asyncpg://user:password@localhost:5432/mydatabase"

# 2. 커넥션 풀을 포함한 AsyncEngine 생성
#    - pool_size: 풀에 유지할 최소한의 커넥션 수 (기본값: 5)
#    - max_overflow: 풀 크기를 초과하여 생성할 수 있는 임시 커넥션 수 (기본값: 10)
engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    echo=True,  # 실행되는 SQL 쿼리를 로그로 보고 싶을 때 True로 설정
)

# 3. 데이터베이스 세션 생성을 위한 SessionLocal 클래스
#    - autocommit=False: 커밋을 수동으로 관리
#    - autoflush=False: flush를 수동으로 관리
#    - bind=engine: 이 세션 팩토리가 위에서 만든 엔진을 사용하도록 바인딩
AsyncSessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
```

`create_async_engine` 함수가 바로 커넥션 풀의 핵심입니다. `pool_size`는 애플리케이션이 평상시에 유지할 연결의 수를, `max_overflow`는 트래픽이 급증했을 때 임시로 추가 생성할 수 있는 연결의 수를 의미합니다. 예를 들어 위 설정에서는 기본적으로 10개의 연결을 유지하고, 최대 30개(10 + 20)의 동시 연결을 처리할 수 있습니다.

---

## 3페이지: API 요청의 흐름과 올바른 커넥션 관리

커넥션 풀을 만들었다면, 이제 FastAPI의 API 엔드포인트에서 이 풀의 연결을 어떻게 사용하고 반환하는지 알아봐야 합니다. 가장 우아하고 안전한 방법은 FastAPI의 **의존성 주입(Dependency Injection)** 시스템을 활용하는 것입니다.

### 1. 의존성 주입을 위한 함수 생성

데이터베이스 세션(연결)을 제공하고, 요청 처리가 끝나면 안전하게 반납하는 `get_db` 함수를 만듭니다.

**`dependencies.py` (또는 `main.py` 상단)**
```python
from database import AsyncSessionLocal

async def get_db():
    """
    API 요청마다 데이터베이스 세션을 생성하고, 요청이 끝나면 닫는 의존성 함수
    """
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()
```

이 함수의 작동 방식은 다음과 같습니다.

1.  `async with AsyncSessionLocal() as db:`: 커넥션 풀에서 연결을 하나 가져와 `db`라는 `AsyncSession` 객체를 생성합니다.
2.  `yield db`: 생성된 `db` 세션을 API 엔드포인트 함수에 주입합니다. API 함수의 코드가 이 시점에서 실행됩니다.
3.  `finally: await db.close()`: API 함수의 실행이 성공하든, 중간에 예외가 발생하든 상관없이 **항상** 실행됩니다. `db.close()`는 실제 TCP 연결을 끊는 것이 아니라, **사용한 커넥션을 커넥션 풀에 반납(release)하는 역할**을 합니다. 이 부분이 커넥션 풀 관리의 핵심입니다.

### 2. API 엔드포인트에서 `get_db` 사용하기

이제 API 라우터에서 `Depends`를 사용하여 `get_db` 함수를 주입받습니다.

**`main.py`**
```python
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import Item  # SQLAlchemy 모델 (미리 정의했다고 가정)
from dependencies import get_db

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(item_id: int, db: AsyncSession = Depends(get_db)):
    """
    데이터베이스에서 특정 아이템을 조회하는 API
    """
    # 1. `db`는 get_db 함수가 제공한 커넥션 풀의 세션입니다.
    query = select(Item).where(Item.id == item_id)
    result = await db.execute(query)
    item = result.scalars().first()

    # 2. 비즈니스 로직 처리
    if item is None:
        # ... 오류 처리
        pass
    
    # 3. 함수가 리턴되면 `get_db`의 finally 블록이 실행되어
    #    커넥션이 풀에 자동으로 반납됩니다.
    return item
```

### 단일 API 요청의 전체 흐름 요약

1.  **요청 수신**: 클라이언트가 `/items/123`으로 GET 요청을 보냅니다.
2.  **의존성 해결**: FastAPI는 `read_item` 함수를 실행하기 전에 `Depends(get_db)`를 확인하고 `get_db` 함수를 호출합니다.
3.  **커넥션 획득**: `get_db` 함수는 `AsyncSessionLocal()`을 통해 커넥션 풀에 유휴 연결이 있는지 확인합니다.
    - **(있을 경우)**: 즉시 유휴 연결을 가져와 세션을 만들어 `yield` 합니다.
    - **(없을 경우)**: `pool_size`와 `max_overflow` 한도 내에서 새 연결을 생성하여 `yield` 합니다. 만약 풀이 꽉 찼다면, 다른 요청이 연결을 반납할 때까지 잠시 대기합니다.
4.  **비즈니스 로직 실행**: `read_item` 함수는 `yield`된 `db` 세션을 사용하여 데이터베이스 쿼리를 실행하고 결과를 처리합니다.
5.  **커넥션 반납**: `read_item` 함수의 실행이 끝나고 응답을 반환하면, `get_db` 함수의 `finally` 블록이 실행됩니다. `await db.close()`가 호출되면서 사용했던 연결이 다시 커넥션 풀로 돌아가 유휴 상태가 됩니다.
6.  **응답 전송**: FastAPI가 최종 결과를 클라이언트에게 HTTP 응답으로 보냅니다.

## 결론

FastAPI에서 데이터베이스 커넥션 풀을 사용하는 것은 선택이 아닌 필수입니다. SQLAlchemy와 의존성 주입을 통해 구현된 커넥션 풀은 코드의 복잡성을 낮추면서도, 데이터베이스의 부하를 획기적으로 줄여 애플리케이션 전체의 성능과 안정성을 보장합니다. 이 가이드를 통해 여러분의 FastAPI 애플리케이션이 한 단계 더 높은 성능을 발휘할 수 있기를 바랍니다.
