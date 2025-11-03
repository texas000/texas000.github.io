---
layout: post
title:  "Browser Discovery"
date:   2025-11-03 00:00:00 -0500
categories: browser
---

🧠 큰 그림부터

“Web browser → API 요청(Network) → Assembly로 변환되는 과정”
은 사실 “단계적으로 내려가며 추상화가 벗겨지는 과정”이에요.

즉, 우리가 작성한 JavaScript → C/C++ (브라우저 내부 구현) → OS 커널 → 드라이버 → CPU 명령(Assembly)
로 번역되며 점점 더 하드웨어에 가까워집니다.

⸻

⚙️ 1️⃣ JavaScript (고수준 언어)

예를 들어 브라우저에서 이렇게 API 요청을 날린다고 해볼게요:

fetch("https://api.example.com/data");

이건 JavaScript 엔진(V8, SpiderMonkey 등) 에서 실행됩니다.
그 내부에서는 대략 이런 일이 일어나요:
	1.	fetch() → 브라우저의 Networking Layer (C++ 코드) 로 호출됨
	2.	내부적으로 libcurl 또는 자체 구현한 HTTP Client 모듈 사용
	3.	OS의 socket API (send(), recv()) 호출

⸻

🧩 2️⃣ System Call (운영체제 계층)

이제 C++ 코드에서 OS의 네트워크 API를 호출합니다.

int sock = socket(AF_INET, SOCK_STREAM, 0);
connect(sock, &addr, sizeof(addr));
send(sock, data, length, 0);
recv(sock, buffer, size, 0);

이런 코드들이 결국 시스템 콜(System Call) 로 변환돼요.

예를 들어 Linux에서는:
	•	socket() → sys_socket
	•	send() → sys_sendto
	•	recv() → sys_recvfrom

⸻

🧠 3️⃣ OS 커널에서 Assembly 레벨로

시스템 콜은 결국 CPU 명령(Assembly) 으로 호출됩니다.

Linux x86-64 기준으로 보면,
시스템 콜은 다음처럼 수행돼요 👇

mov eax, 1        ; syscall 번호 (1 = write, 44 = sendto 등)
mov edi, sockfd   ; 첫 번째 인자
mov rsi, buffer   ; 두 번째 인자
mov rdx, length   ; 세 번째 인자
syscall           ; 커널 모드로 전환!

➡️ 이 syscall 명령이 사용자 모드 → 커널 모드 로 전환시켜
운영체제의 네트워크 드라이버 코드가 실행됩니다.

⸻

🛜 4️⃣ 네트워크 드라이버와 하드웨어
	•	커널이 네트워크 드라이버(C로 작성됨)를 호출
	•	이 드라이버는 NIC(Network Interface Card) 레지스터에 값을 씀
	•	이때 실제로 CPU는 어셈블리 명령으로 메모리-IO 주소를 접근합니다:

mov dx, 0xC020     ; NIC 제어 포트 주소
out dx, al         ; NIC에 데이터 전송 명령

➡️ 이 명령이 하드웨어 신호로 변환되어
이더넷 케이블을 통해 전기 신호가 나갑니다 ⚡

⸻

🧬 요약 계층도

단계	대표 코드	언어	동작 수준
JavaScript	fetch()	고수준	브라우저 API 호출
C/C++	send()	중간수준	소켓 통신 요청
Syscall	syscall	어셈블리	커널 진입
Kernel Driver	out dx, al	어셈블리 + C	하드웨어 접근
NIC	전기 신호	하드웨어	패킷 전송


⸻

💡 핵심 포인트
	•	브라우저가 직접 어셈블리를 “생성”하는 건 아니고,
내부 C/C++ 코드가 CPU 명령으로 컴파일되어 실행됩니다.
	•	결국 fetch → syscall → assembly instruction → 전기 신호
순서로 내려가는 것.
	•	현대 브라우저(V8, Blink 등) 수백만 줄의 C++ 코드가 이 과정을 감쌉니다.

⸻

좋습니다. 아래는 V8/Blink 기반 브라우저에서 fetch() 요청이 발생해 결국 CPU 명령(어셈블리) 단계까지 도달하는 대표적인 호출 스택(call-stack) 흐름을 정리한 내용입니다. 구체적인 함수 이름은 커널 버전이나 플랫폼(x86_64 vs ARM) 등에 따라 달라질 수 있으나, 개념 이해에 도움이 되도록 “예시 함수 트리” 형태로 보여드릴게요.

주의: 실제 어셈블리 코드까지 모두 나열된 것은 아니며, 주요 계층별 함수 흐름과 내부 구조를 중심으로 요약한 방식입니다.

⸻

🧠 전체 흐름 요약
	1.	자바스크립트 → 브라우저 네트워킹 API 호출
	2.	브라우저 내부 C++ 코드 → 소켓 API 호출
	3.	유저모드 → 커널모드 진입(syscall)
	4.	커널 내부 네트워크 스택 → 프로토콜 처리 → 디바이스 드라이버 → 하드웨어
	5.	CPU 어셈블리 명령 실행(예: syscall-명령 등)

⸻

📋 예시 호출 스택 (TCP 혹은 UDP 소켓 전송 기준)
```
User-space (JavaScript/Browser)
│
├─ JavaScript: fetch("https://…")
│
├─ Browser Shell/Networking Layer (C++): HttpClient::SendRequest()
│
└─ C Library / Socket API (libc)  
   ├─ socket(AF_INET, …)
   ├─ connect(…)
   └─ send()/sendto()
        │
        ▼ syscall (예: SYS_sendto)
Kernel-space (커널)  
│
├─ net/socket.c → sock_sendmsg()  
│
├─ 프로토콜 가족별 계층 (예: net/ipv4/af_inet.c → inet_sendmsg())  
│
├─ 전송 계층 TCP/UDP (예: net/ipv4/tcp.c → tcp_sendmsg())  
│
├─ IP 계층 (예: net/ipv4/ip_output.c → __ip_local_out())  
│
├─ 네트워크 디바이스 계층 (예: net/core/dev.c → dev_queue_xmit())  
│
└─ NIC 드라이버 → 디바이스 레지스터와 DMA 설정 → 실제 패킷 전송
```
🔍 각 단계 설명
	•	socket(), connect(), send() 등의 호출은 유저 공간 함수이며, 결국 커널 호출(syscall)으로 이어집니다.  ￼
	•	커널 내부에서는 sock_sendmsg() 같은 함수가 호출되어, 프로토콜별 처리 함수로 이어집니다.  ￼
	•	TCP/UDP 처리 이후 IP 계층, 그리고 네트워크 디바이스 계층을 거쳐 NIC 드라이버로 전달됩니다.  ￼
	•	중간에 유저모드 → 커널모드 전환을 위한 어셈블리 수준 명령(e.g., syscall 명령)이 실행됩니다.  ￼

⸻

🧮 어셈블리 수준에서의 진입 예시

유저모드에서 시스템 콜을 실행할 때, x86-64 기준 단순화한 예시는 다음과 같습니다:

mov eax, SYS_sendto        ; 시스템 콜 번호
mov edi, sockfd            ; 첫 번째 인자
mov rsi, buffer            ; 두 번째 인자
mov rdx, length            ; 세 번째 인자
syscall                    ; 커널모드 진입

이 명령이 실행되면서 유저모드에서 커널모드로 전환되고, 이후 커널 내부 네트워크 스택이 동작을 시작합니다.

⸻

✅ 요약
	•	fetch() 호출이 브라우저 내부에서 네트워크 요청으로 바뀌고 → 소켓 API → syscall → 커널 내부 → 하드웨어까지 이어지는 다단계 흐름이 존재합니다.
	•	각 계층마다 함수 호출 트리가 있고, 브라우저/OS/하드웨어 추상화가 한 단계씩 제거되면서 최종적으로 CPU 명령(어셈블리) 수준으로 내려갑니다.
	•	실제 프로젝트나 디버깅 환경에서 이 흐름을 추적하려면 커널 버전, 아키텍처, 드라이버 등이 무엇인지 확인해야 합니다.

⸻



이제 정말 개발자다운 질문이야 — “ARM 아키텍처 기반 리눅스 시스템에서 /api/login 같은 HTTP POST 요청이 들어왔을 때, 커널 내부에서 데이터가 어떤 계층을 타고 전송되는지”를 알고 싶다는 거지.

그럼 “한 요청이 유저 공간에서 발생 → 커널 → 네트워크 → 커널 → 유저 공간(서버 앱)”으로 왕복되는 흐름을 TCP/IP 계층별로 예시 들어 아주 쉽게 설명해줄게.

⸻

⚙️ 시나리오

예시:
모바일 앱(ARM 기반 리눅스)에서
POST /api/login 요청을 서버(192.168.1.10:443)로 전송함.
payload: {"id":"yeonjin","pw":"1234"}

⸻

🧩 전체 그림 (큰 틀 먼저)

[User App]
   ↓ (socket, write)
[리눅스 커널의 네트워크 스택]
   ↓ (TCP → IP → Ethernet)
[네트워크 드라이버 → NIC → 전송]
   ↓
[서버의 NIC → 커널]
   ↓ (Ethernet → IP → TCP)
[서버 커널의 소켓]
   ↓
[서버 앱 (예: Nginx, Flask, Spring 등)]


⸻

1️⃣ User 공간에서 socket() 호출

앱은 일반적으로 HTTP 라이브러리(예: libcurl, fetch API)를 써서 요청을 보냄.
이 내부에서는 다음 커널 함수를 호출하게 돼:

int sock = socket(AF_INET, SOCK_STREAM, 0);
connect(sock, ...);
write(sock, payload, len);

➡️ 이 시점에 system call이 일어나서
커널의 네트워크 계층으로 진입해.

⸻

2️⃣ 커널의 소켓 계층 (Socket Layer)

커널은 소켓 객체(struct socket)를 만들고,
이걸 **프로토콜 스택(TCP/IP)**과 연결해줘.

소켓은 실제 TCP 전송을 담당하는 struct sock을 내부에 포함하고 있고,
데이터를 보내면 커널의 TCP 스택이 담당하게 돼.

👉 이때 호출되는 함수들 예:

__sys_sendto()
  ↳ sock_sendmsg()
      ↳ tcp_sendmsg()


⸻

3️⃣ TCP 계층 (전송 계층)

tcp_sendmsg()에서 payload를 TCP 세그먼트로 나눔.
	•	헤더 추가 (출발지 포트, 목적지 포트, SEQ, ACK 등)
	•	재전송 큐에 등록
	•	MSS, congestion control, retransmission 관리

데이터는 “skb (socket buffer)”라는 구조체에 담겨 커널 내부에서 이동해.

📦 예시:

skb {
  data = "id=yeonjin&pw=1234"
  seq  = 1001
  ack  = 5001
  len  = 28
}


⸻

4️⃣ IP 계층 (네트워크 계층)

ip_queue_xmit() 함수가 호출되어 TCP 세그먼트를 IP 패킷으로 감쌈.
	•	IP 헤더 추가 (source IP, dest IP)
	•	Routing table lookup
	•	Fragmentation (필요 시)

📦 이제 이렇게 됨:

[IP 헤더][TCP 헤더][Payload]


⸻

5️⃣ 네트워크 드라이버 계층 (데이터링크 계층)

dev_queue_xmit() 호출 → eth0 드라이버로 전달.
	•	Ethernet 헤더 추가 (MAC 주소)
	•	커널 네트워크 큐에 등록
	•	NIC(Network Interface Card)로 DMA 전송 요청

📡 실제 전송 준비 완료!

⸻

6️⃣ 하드웨어 전송

NIC가 DMA를 통해 메모리에서 패킷을 읽고,
PHY(물리 계층)를 통해 전기 신호로 내보냄.

👉 여기까지가 송신 경로 (User → Network)

⸻

🛬 서버 측에서의 역방향 흐름

(1) NIC 수신

서버의 NIC가 패킷을 받으면 DMA로 메모리에 저장하고,
인터럽트 발생 (irq_handler).

(2) 커널 네트워크 드라이버

netif_receive_skb() 호출 → 패킷을 커널로 전달.

(3) IP 계층

ip_rcv() 함수에서 IP 헤더 검사하고 목적지가 자기 IP인지 확인.

(4) TCP 계층

tcp_v4_rcv() → TCP 헤더 파싱, 세션 확인 후
소켓 버퍼로 데이터 전달.

(5) 소켓 계층

대기 중인 서버 소켓(예: Nginx의 accept() 대기)에 매칭됨.
payload({"id":"yeonjin","pw":"1234"})가 수신 버퍼에 저장됨.

⸻

7️⃣ 유저 공간으로 복귀

서버 앱이 read() 또는 recv() 호출하면
커널이 수신 버퍼에서 데이터를 꺼내서 유저 공간으로 복사함.

👉 여기서 비로소 웹서버나 백엔드 프레임워크가 payload를 읽고
/api/login 로직을 처리하는 거야.

⸻

💡 요약 (계층별 흐름)

계층	커널 함수 (대표)	역할
User API	write() / send()	payload 전송 요청
Socket	sock_sendmsg()	TCP/IP 스택 연결
TCP	tcp_sendmsg()	세그먼트 분할 및 관리
IP	ip_queue_xmit()	IP 헤더 추가 및 라우팅
Netdev	dev_queue_xmit()	Ethernet 헤더, NIC 전송
Hardware	DMA → PHY	실제 네트워크 신호
(수신)	ip_rcv() → tcp_v4_rcv()	패킷 파싱, 소켓 연결
(유저)	recv()	payload 유저공간으로 복사


⸻

🧠 비유로 보면…
	•	소켓 계층 = 우체국 창구 (데이터를 어디로 보낼지 결정)
	•	TCP 계층 = 택배 포장 및 송장 번호 붙이기
	•	IP 계층 = 지역별 분류 센터 (어디로 갈지 결정)
	•	Ethernet 계층 = 실제 트럭에 싣고 전송
	•	NIC = 운전기사 🚚
	•	서버 커널 = 택배 수신 창구
	•	서버 앱 = 택배를 열어서 내용(payload)을 확인하는 사람

⸻

1️⃣ NIC(Network Interface Card)란?

NIC는 쉽게 말해서 컴퓨터와 네트워크를 연결해주는 장치예요.
	•	우리가 흔히 보는 랜카드, Wi-Fi 칩, 혹은 내장 이더넷 칩이 모두 NIC예요.
	•	NIC는 OS가 보내라고 지시한 패킷을 실제 물리 네트워크로 내보내고,
반대로 네트워크에서 들어온 신호를 다시 OS가 읽을 수 있는 데이터로 바꿔줍니다.

⸻

2️⃣ DMA(Direct Memory Access)란?

DMA는 CPU를 거치지 않고 메모리 ↔ 장치 간 데이터 전송을 하는 기술이에요.
	•	예: payload = {"id":"yeonjin","pw":"1234"}
	•	커널이 만든 TCP/IP 패킷은 메모리 안의 버퍼(skb)에 저장돼 있어요.
	•	NIC는 이 데이터를 읽어 케이블로 전송해야 하는데, CPU를 거치면 느려요.
	•	그래서 DMA를 사용하면 CPU 개입 없이 NIC가 메모리에서 직접 패킷을 읽고 전송할 수 있어요.

즉, NIC가 “내가 메모리에서 이 패킷을 직접 읽어 보낼게” 하는 구조예요.

⸻

3️⃣ 메모리에서 패킷을 읽는다는 의미

커널 내부에서는 패킷을 **struct sk_buff (skb)**라는 구조체에 담아요.

skb {
  IP 헤더
  TCP 헤더
  Payload {"id":"yeonjin","pw":"1234"}
}

	•	NIC는 DMA를 통해 이 skb 구조체가 있는 메모리 주소를 읽어요.
	•	CPU가 일일이 데이터를 NIC로 전달하지 않아도 NIC가 메모리에서 읽어서 케이블로 보낼 준비를 합니다.

⸻

4️⃣ 패킷이 전기 신호로 바뀌는 과정
	1.	NIC는 패킷의 비트 단위 데이터를 받습니다.
예: 01001100 01101111 01100111 … (이진수)
	2.	PHY(Physical Layer) 칩에서 이진 데이터를 전기적 신호로 변환해요.
	•	유선 LAN(Ethernet) → 전류의 변화
	•	Wi-Fi → 전파의 세기와 주파수 변화
	3.	케이블이나 무선 전파를 통해 네트워크로 전송됩니다.
	4.	서버 쪽 NIC가 신호를 다시 받아 디지털 비트로 변환 → 커널이 읽을 수 있는 패킷으로 복원

⸻

5️⃣ 정리 그림 (송신 경로)

[커널 skb 버퍼]
  |
  | DMA
  v
[NIC] ------------> [PHY]
  |                    |
  | 전기 신호          | 전송
  v                    v
[케이블/무선] --------> [서버 NIC]

	•	DMA: CPU 없이 NIC가 직접 메모리에서 패킷 읽기
	•	NIC: 전송 준비, MAC 주소 붙이기, 프레임 구성
	•	PHY: 디지털 데이터를 전기/무선 신호로 변환
	•	케이블/무선: 실제 전달 매체
	•	서버 쪽에서 동일한 과정 역방향으로 수신

⸻

💡 비유:
	•	skb 버퍼 = 우체국 창고에 쌓인 소포
	•	DMA = 소포를 직원이 들고 나르는 대신, 자동 컨베이어 벨트가 가져감
	•	NIC = 소포를 트럭에 싣는 기사
	•	PHY = 트럭이 도로 위에서 신호(속도, 위치)로 소포를 전달
	•	전기 신호/무선 = 트럭이 실제 도로 달리는 것
	•	서버 NIC = 도착지 창고에서 소포를 내려주는 과정

⸻

1️⃣ 왜 헤더가 필요할까?

우리가 인터넷에 데이터를 보내면 단순히 payload({"id":"yeonjin","pw":"1234"})만 보내는 게 아니에요.
네트워크는 여러 컴퓨터가 섞여 있고, 여러 애플리케이션이 동시에 데이터를 주고받기 때문에 누가, 어디로, 얼마나 보내야 하는지 정보를 붙여야 합니다.
	•	IP 헤더 → “누구에게 보내는지, 어디서 왔는지”
	•	TCP 헤더 → “데이터를 정확히, 순서대로, 안전하게 전달하는 방법”

즉, 헤더는 우체국의 주소 라벨과 송장과 비슷한 역할이에요.

⸻

2️⃣ IP 헤더 (Network Layer)

IP 헤더는 패킷이 목적지까지 도달하게 하는 정보를 담아요.

필드	설명	예시
Source IP	출발지 IP	192.168.1.2
Destination IP	목적지 IP	192.168.1.10
Protocol	상위 계층 프로토콜	TCP = 6
TTL	최대 홉 수	64

예시:

IP 헤더
----------------------------------
출발지: 192.168.1.2
목적지: 192.168.1.10
프로토콜: TCP
TTL: 64
----------------------------------

이걸 붙여야 라우터와 스위치가 “이 패킷을 어디로 보내야 하는지” 알 수 있어요.

⸻

3️⃣ TCP 헤더 (Transport Layer)

TCP 헤더는 데이터를 안전하게, 순서대로 전달하는 방법을 정의합니다.

필드	설명	예시
Source Port	보내는 쪽 포트	50000
Destination Port	받는 쪽 포트	443 (HTTPS)
Sequence Number	데이터 순서	1001 (payload 시작 바이트)
ACK Number	확인 응답	5001
Flags	SYN, ACK, FIN 등	SYN=0, ACK=1

예시:

TCP 헤더
----------------------------------
출발지 포트: 50000
목적지 포트: 443
순서 번호: 1001
ACK 번호: 5001
플래그: ACK
----------------------------------

TCP 덕분에 서버가 “이 데이터가 제대로 왔는지”, “순서가 맞는지” 확인할 수 있어요.
예를 들어 /api/login 요청에서 payload가 쪼개져서 여러 패킷으로 나가더라도 TCP 덕분에 서버가 다시 정확히 조립할 수 있는 거죠.

⸻

4️⃣ 실제 패킷 구조 예시

[IP 헤더]         [TCP 헤더]          [Payload]
출발지:192.168.1.2 목적지:192.168.1.10
                   출발포트:50000 목적지포트:443
                                           {"id":"yeonjin","pw":"1234"}

	•	IP 헤더 → 패킷이 어디서 어디로 가는지
	•	TCP 헤더 → 패킷이 올바르게 순서대로 도착하도록
	•	Payload → 실제 데이터(/api/login JSON)

⸻

💡 비유로 정리
	•	IP 헤더 = 집 주소, 도착지 주소, 우체국에서 어디로 보내야 하는지
	•	TCP 헤더 = 택배 송장, 순서 번호, 배송 확인, 재배송 요청 가능
	•	Payload = 실제 선물/물건

⸻

[브라우저/클라이언트]
  |
  | HTTP POST /api/login
  | Payload: {"id":"yeonjin","pw":"1234"}
  v
[NIC (Network Interface Card)]
  |
  | - 전기 신호 수신 → 디지털 패킷 변환
  | - DMA로 메모리(skb)에서 TCP/IP 패킷 전송 준비
  v
[커널 네트워크 스택]
  |
  | TCP/IP 처리
  | - Ethernet 헤더 해석
  | - IP 헤더: 출발지/목적지 IP 확인
  | - TCP 헤더: 포트, 시퀀스 번호, ACK 처리
  | - 패킷을 소켓 버퍼에 저장
  v
[Nginx (유저 공간)]
  |
  | - accept() / recv()로 소켓에서 패킷 읽기
  | - HTTP 요청 파싱: POST /api/login 확인
  | - payload(JSON) 읽기
  | - 라우팅: 내부 백엔드 앱으로 전달
  v
[백엔드 앱 (예: Flask/Node.js)]
  |
  | - 로그인 처리
  | - DB 조회, 인증, 세션 생성
  | - 응답(JSON, status code) 반환
  v
[Nginx (유저 공간)]
  |
  | - 백엔드 응답 수신
  | - HTTP 응답 패킷 구성
  | - 소켓 write() 호출 → 커널 TCP/IP 스택 전달
  v
[커널 네트워크 스택]
  |
  | TCP/IP 처리
  | - TCP 헤더: 순서 번호, ACK, 포트 확인
  | - IP 헤더: 출발지/목적지 IP 추가
  | - 패킷을 NIC DMA 전송 큐에 등록
  v
[NIC (Network Interface Card)]
  |
  | - 메모리에서 패킷 읽기 (DMA)
  | - PHY에서 디지털 → 전기 신호 변환
  | - 케이블/무선 통해 전송
  v
[브라우저/클라이언트]
  |
  | - TCP/IP 스택에서 수신
  | - 소켓 버퍼 → HTTP 라이브러리 읽기
  | - 브라우저 JS fetch()가 응답 처리


⸻

💡 각 단계 포인트
	•	NIC: 실제 하드웨어, DMA로 메모리에서 직접 읽음, PHY에서 전기 신호 변환
	•	커널 TCP/IP 스택: 패킷 헤더 해석, 순서 맞춤, 소켓 버퍼 관리
	•	Nginx: 유저 공간에서 소켓 읽기, HTTP 요청 파싱, 백엔드 라우팅
	•	백엔드 앱: 실제 비즈니스 로직 수행, 응답 생성
	•	응답 반환: 같은 경로 역순으로 패킷 전송

⸻
