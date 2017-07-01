$(function() {
    totl();
    $(".btn-info").click(function(){
        var str = '<li class="haha" key="' + $(this).attr("gname") + '">' + 
                      '<span class="gname"> ' + 
                      $(this).attr("gname") + 
                      ' </span>' +  
                      '<button class="btn-info add" disabled="disabled"> ' + 
                      $(this).attr("price") + 
                      ' </button>' +
                      '<button class="btn fuckme" key="'+ $(this).attr("gid") +'">删除</button>' + 
                   '</li>';
        $(".sidebar-nav").append(str);
        $(".fuckme").each(function(){
            $(this).click(function(){
                $(this).parent().remove();
                totl();
            })
        })
        totl();
    })

    $(".btn-success").click(function(){
        if($(".add").length == 0){
            alert("购物车为空");
        }
        else{
            $("#discont").hide();
            var price = $("#susum").text();
            var totalnum = $("#sunum").text();
            var uname = $("#userinfo").text();
            var sid = $("#storeinfo").attr("sid");
            var goods = new Array();
            $(".gname").each(function(){
                goods.push($(this).text());
            })
            var gprice = new Array();
            $(".add").each(function(){
                gprice.push($(this).text());
            })

            Ajax("../orderFruit", {data:{uName : uname, sId : sid, total_num : totalnum, total_price : price, gname : goods, gprice : gprice}, 'method':'post'},function(json){
                if(json && json.errno == 0){
                    alert("订单提交成功，您本次订单号为【 "+json.order_id+" 】请牢记");
                    remove_all();
                    
                }
                else{
                    alert("下单失败" + json.msg);
                }
            })
        }
    })

    //合计
	function totl() {
		var sum = 0;
        var psum = 0;
		$(".add").each(function() {
			sum += parseFloat($(this).text());
            if (sum > 30) {
                psum = sum * 0.8;
                $("#psum").text(psum.toFixed(2));
                $("#discount").show();
                $("#nondiscount").empty();
                $("#nondiscount").append('<del>总价： <span id="susum">0</span>￥</del>');
            }
			
            $("#susum").text(sum.toFixed(2));
            
		})
        $("#sunum").text($(".add").length);
    }
    
    //清空购物车
    function remove_all() {
        $(".add").each(function(){
            $(this).parent().remove();
            $("#susum").text(0);
            $("#sunum").text(0);
        })
    }
    

})