function msg(){
    document.getElementById("demo").innerHTML = "Paragraph changed."
    var randomnum=(Math.random());
    var el = document.getElementById('info');
    el.innerHTML='<h2>random number</h2><p>'+randomnum+'</p>';
    //alert("Current page: "+window.screen.height);

    var msg = '<p>page title: '+document.title+'<br/>';
    msg += 'page address: '+document.URL+'<br/>';
    msg += 'last modified: '+document.lastModified+'</p>';

    var aa = document.getElementById('footer');
    aa.innerHTML=msg

    alert(window.location)
}
