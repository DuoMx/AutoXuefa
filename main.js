//var bg = chrome.extension.getBackgroundPage();
var fullurl =  window.location.href;
$("[name='password']").val("xfks1234");

var totalAnswer={"14926":"C","14933":"A","14917":"D","14927":"B","14923":"A","14921":"A","14916":"B","14924":"C","14919":"D","14925":"A","14928":"D","14914":"A","14929":"A","14932":"A","14920":"A","14918":"D","14930":"D","14931":"C","14915":"A","14922":"D","14935":"CDE","14943":"ABCD","14937":"ABC","14941":"ABCD","14938":"AD","14939":"ABCD","14936":"ACE","14934":"ABC","14942":"AB","14940":"AC","14950":"V","14949":"V","14944":"V","14952":"V","14946":"V","14951":"V","14948":"V","14945":"X","14947":"X","14953":"V","14973":"B","14958":"A","14959":"C","14969":"B","14961":"D","14960":"D","14968":"B","14966":"A","14970":"C","14965":"B","14967":"A","14971":"B","14957":"A","14962":"D","14964":"C","14972":"C","14954":"A","14956":"A","14963":"C","14955":"A","14981":"ABD","14974":"BCD","14982":"ABCD","14975":"CD","14976":"ABC","14983":"ABCD","14979":"ABCDE","14977":"ABCD","14980":"ABCD","14978":"ABC","14989":"V","14988":"V","14993":"V","14991":"X","14985":"V","14984":"V","14987":"V","14986":"X","14992":"V","14990":"X","15005":"A","15003":"A","15007":"C","15008":"A","15011":"B","14997":"A","14994":"A","15002":"B","15012":"B","15001":"B","14996":"B","15013":"A","14995":"A","15010":"D","15009":"C","15004":"B","14998":"B","15000":"D","15006":"C","14999":"D","15015":"ABD","15014":"BCD","15017":"ACD","15019":"ABC","15023":"ABCD","15018":"ABCD","15016":"ABC","15020":"ABD","15021":"ABC","15022":"ABC","15027":"V","15028":"V","15026":"V","15032":"V","15033":"V","15030":"X","15031":"V","15025":"X","15029":"V","15024":"V"};

var courseList =[];//课程列表
var chapterList =[];//章节列表
var exerciseList=[];//练习列表
var courseCount = 0;
var chapterCount = 0;
var exerciseCount=0;
const delaytime = 300;

//统计页面开始收集课程资料
if(fullurl.indexOf("study/statistics")>0){	
	FindCourseList();
	StartLearnAll();
	StartExercise();
}

//开始全部学习
function StartLearnAll () {	
	chrome.storage.local.get(['chapterList'], function(result) {			
		changeBadgeColor("green");
		sleep(delaytime);
		for(i=0;i<result.chapterList.length;i++){
			var percentnum = ((i+1) / result.chapterList.length*100).toFixed(0);
			changeBadgeText(percentnum+"%");
			var getchaptersuccess  = getChapterContent(result.chapterList[i]);
				if(getchaptersuccess){							
					indexchapter = result.chapterList[i].indexOf("chapter");
					var chapternum = result.chapterList[i].substring(indexchapter+8);	
					console.log('获取章节资料：'+chapternum+'成功，开始进度：'+percentnum+"%。");
					sleep(delaytime);
					submitLearn(chapternum);
				}
		}				
	});
}

//模拟学习
function submitLearn (chapterNum) {			
	$.ajax({  
		type : "post",  
		url : "/study/learn/"+chapterNum,  
		data : null,  
		async : false,  
		success : function(data){  				
			//console.log("章节:"+chapterNum+"学习完毕");			
		}			  
	});	
}
//开始全部练习题
function StartExercise () {	
	chrome.storage.local.get(['exerciseList'], function(result) {	
		exerciseBuild(result.exerciseList[0]['courseId'],result.exerciseList[0]['chapterId']);	
	});
}



//检测课程
function FindCourseList(){	
	$.ajax({  
		type : "get",  
		url : "http://xfks-study.gdsf.gov.cn/study/index",  
		data : null,  
		async : false,  
		success : function(data){ 				
		     indexdom = $(data).find("#pre");			
		}			  
	});	
	console.log("开始检测课程");
	indexdom.find(".card.current").each(function (){
		courseList.push($(this).children("h3").children("a").attr("href"));
		courseCount++;		
	});
	console.log("检测到"+courseCount+"个课程");
	console.log("开始检测章节及练习题");
	changeBadgeColor("orange");
	for(i=0;i<courseList.length;i++){	
	    var percentnum = ((i+1) / courseList.length*100).toFixed(0);
		changeBadgeText(percentnum+"%");		
		FindChapterList(courseList[i]);
	}	
	console.log("检测到"+chapterCount+"个章节,"+exerciseCount+"份练习题。");
	chrome.storage.local.set({"chapterList": chapterList}, function() {		
	});
	chrome.storage.local.set({"exerciseList": exerciseList}, function() {		
	});
}

//检测章节
function FindChapterList(courseUrl){	
	var chaptersdom;
	var rootdom;	
	$.ajax({  
		type : "get",  
		url : courseUrl,  
		data : null,  
		async : false,  
		success : function(data){ 				
			rootdom = $(data);
		    chaptersdom = $(data).find("#chapter-none");			
		}			  
	});		
	chaptersdom.children("li").each(function(){		
		if($(this).find("a").attr("href").indexOf("study/course")>0){
		   chapterList.push("http://xfks-study.gdsf.gov.cn"+$(this).find("a").attr("href"));
		   chapterCount++;
		}		
		
	})	
	rootdom.find("td.title").find("a[onclick]").each(function (){ 
		var onclickString  = $(this).attr("onclick");		
		courseIdString = onclickString.split(',')[0].split('(')[1];
		chapterIdString=onclickString.split(',')[1].split(')')[0];
		exerciseList.push({'courseId':courseIdString,'chapterId':chapterIdString});
		exerciseCount++;
	});
}







//做习题
var indexexercise = fullurl.indexOf("exercise");
if(indexexercise>0){
	chrome.storage.local.get(['exerciseList'], function(result) {		
		changeBadgeColor("red");
		changeBadgeText("练习");	
		sleep(delaytime);
		exerciseList = result.exerciseList;				
		var exercisenum = fullurl.substring(indexexercise+9);	
		var xuefaexerciseurl ="/study/submitExercise/"+exercisenum;
		var answerjson={};
		var isback2index = true;
		$(".item").each(function(){
			var qid=$(this).attr("qid");
			var answer=$(this).find(".answer").attr("val");
			answerjson[qid]=answer;		
		});	
		$.ajax({  
			type : "post",  
			url : xuefaexerciseurl,  
			data : answerjson,  
			async : false,  
			success : function(data){ 
				if(data.toString().indexOf('满分')>0){
					for(i=0;i<exerciseList.length-1;i++){
						if(exercisenum==exerciseList[i]['chapterId']){
							isback2index = false;
							exerciseBuild(exerciseList[i+1]['courseId'],exerciseList[i+1]['chapterId']);
						}
					}	
					if(isback2index){
						changeBadgeColor("blue");
						changeBadgeText("完成");
						window.location.href= "http://xfks-study.gdsf.gov.cn/study/index";	
					}					
				}			
			}			  
		});		
	});		
}

//获取章节内容
function getChapterContent(chapterUrl){
	var result= false;
	$.ajax({  
		type : "get",  
		url : chapterUrl,  
		data : null,  
		async : false,  
		success : function(data){ 			
			result = true;			
		}			  
	});		
	return result;
}

//创建练习题
function exerciseBuild(courseId,chapterId){
	jQuery.ajax({
		url: "/study/exerciseBuild/"+courseId+"/chapter/"+chapterId,
		method:"post",
		data:null,
		success:function(data){
			window.location.href = "/study/exercise/"+data;
		},
		error:function(data){
			startExercise = false;
			if(data.status == 400){
				alert(data.responseText);
			}else{
				alert("创建失败");
			}
		}
	})
}
//改变徽章文本
function changeBadgeText(badgetext){
	chrome.runtime.sendMessage({'MsgID':'ChangeBadge','MsgText':badgetext}, (response) => {
	});
}
//改变徽章底色
function changeBadgeColor(colortext){	
	chrome.runtime.sendMessage({'MsgID':'ChangeBadgeColor','MsgText':colortext}, (response) => {	
	});
}

//延迟
var sleep = function(time) {
	dotime = parseInt(Math.random()*(time)+time);
    var startTime = new Date().getTime() + parseInt(dotime, 10);
    while(new Date().getTime() < startTime) {}
};

var indexexam = fullurl.indexOf("exams");
if(indexexam>0)
{
	var examnum = fullurl.substring(indexexam+6);	
	var examurl = "/study/exams/"+examnum;	 
	//alert(examurl);
	var allanserhasfind = false;
	var examarea = 'none';
	var answerjson={};
	var rightqidcount= 0;
	var wrongqidcount = 0;
	var AnswerString = "";
	$(".item").each(function(){
		var qid=$(this).attr("qid");				
		if(totalAnswer[qid].length>0){
			AnswerString+=qid+"="+totalAnswer[qid]+"&";
			rightqidcount ++;				
		}
		else{
			wrongqidcount++;
			$(this).css("background", "#ccc");
		}		
		//answerjson[qid]=answer;
	});
	if(wrongqidcount>0){
		allanserhasfind = false;
	}
	else{
		allanserhasfind = true;			
	}
	AnswerString=AnswerString.substring(0,AnswerString.length-1);	
	if(allanserhasfind){
		jQuery.ajax({
			url:examurl,
			method:"post",
			data: AnswerString,
			success:function(data, text, xhr){
				if(xhr.status == 200){                        
						//alert("提交成功!");                            
							window.location.href = '/study/exam';                        
				}else{
					alert(data);
				}
			},
			error:function(data){
				if(data.status == 400){
					alert(data.responseText)
				}else{
					alert("提交失败");
				}
			}
		})
	}
}