//var bg = chrome.extension.getBackgroundPage();
var fullurl =  window.location.href;
$("[name='password']").val("xfks1234");

var totalAnswer={"17733":"B","17727":"A","17717":"A","17714":"B","17716":"B","17722":"A","17724":"C","17723":"C","17732":"B","17726":"B","17725":"D","17715":"B","17728":"C","17718":"B","17720":"A","17719":"A","17721":"B","17731":"B","17729":"B","17730":"A","17736":"CD","17739":"ABCD","17743":"ABCD","17737":"ABCD","17742":"ABCD","17734":"AB","17741":"ACD","17738":"ABCD","17740":"BC","17735":"ABCD","17746":"V","17745":"V","17750":"X","17748":"V","17749":"V","17753":"V","17751":"V","17747":"V","17744":"V","17752":"V","17769":"B","17762":"A","17763":"C","17766":"B","17772":"B","17765":"D","17760":"A","17754":"B","17771":"B","17755":"D","17756":"B","17773":"B","17768":"C","17767":"A","17764":"C","17770":"A","17758":"B","17757":"B","17761":"A","17759":"D","17780":"ABD","17777":"ABCD","17774":"ABCD","17776":"CD","17783":"ABCD","17781":"ABCD","17779":"ABCD","17778":"ABCD","17775":"ABCD","17782":"ABCD","17788":"V","17787":"X","17789":"V","17793":"V","17790":"X","17786":"V","17785":"V","17792":"V","17791":"V","17784":"V","17807":"A","17802":"A","17812":"B","17806":"B","17795":"D","17794":"B","17798":"A","17810":"A","17805":"D","17813":"B","17811":"B","17809":"B","17801":"B","17808":"C","17799":"D","17796":"A","17804":"C","17800":"A","17797":"B","17803":"C","17822":"ABCD","17816":"CD","17823":"ABCD","17821":"ACD","17815":"ABCD","17817":"ABCD","17820":"ABD","17819":"ABCD","17814":"ABCD","17818":"ABCD","17832":"V","17827":"V","17833":"V","17826":"V","17830":"X","17824":"V","17829":"V","17831":"V","17825":"V","17828":"V"};

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
        var saveexamurl = "/study/saveAnswer/"+examnum;
        //alert(examurl);
        var allanserhasfind = false;
        var examarea = 'none';
        var answerjson={};
        var rightqidcount= 0;
        var wrongqidcount = 0;
        var AnswerString = "";
        $(".item").each(function(){
            var qid=$(this).attr("qid");
            if (typeof totalAnswer[qid] === 'undefined') {
                wrongqidcount++;
                $(this).css("background", "#ccc");
            }
            else{
                AnswerString+=qid+"="+totalAnswer[qid]+"&";
                rightqidcount ++;
            }
            //answerjson[qid]=answer;
        });
        if(wrongqidcount>0){
            allanserhasfind = false;
            alert("共"+wrongqidcount+"条题目未找到答案，未找到答案的题目已变灰!");
        }
        else{
            allanserhasfind = true;
        }

        AnswerString=AnswerString.substring(0,AnswerString.length-1);
        if(allanserhasfind){
            jQuery.ajax({
                url:saveexamurl,
                method:"post",
                data: AnswerString,
                success:function(data, text, xhr){
                    if(xhr.status == 200){
                        alert("已找到全部题目答案，并保存答案成功，效果刷新页面可见!");
                        var issubmitanswer=confirm("是否自动提交答案？");
                        if(issubmitanswer){
                            jQuery.ajax({
                                url:examurl,
                                method:"post",
                                data: AnswerString,
                                success:function(data, text, xhr){
                                    if(xhr.status == 200){
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
