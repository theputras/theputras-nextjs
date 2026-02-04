setTimeout(function () {
    $('.loader_bg').fadeOut();
}, 600);

$(document).ready(function(){
    $(".main-menu ul li.megamenu").mouseover(function(){
        if (!$(this).parent().hasClass("#wrapper")){
        $("#wrapper").addClass('overlay');
        }
    });
    $(".main-menu ul li.megamenu").mouseleave(function(){
        $("#wrapper").removeClass('overlay');
    });
});