var schoolcount={};
var preschoolcount={};
var sslccount={};
var currentprograms={}
var schooldistrictkeys=[];
var preschooldistrictkeys=[];


function loadData(tab)
{
	var content=document.getElementById("load_data").innerHTML;
	if (tab == 'preschool') {
		content="<h2>Preschool Counts</h2>";
    	data=preschoolcount;
    	showBasicData(tab,data);
    	showAssessmentData(content,data,0);
    } else if (tab == 'school') {
    	content = "<br><br><h2>School Counts</h2>";
    	data=schoolcount;
    	showBasicData(tab,data);
    	showAssessmentData(content,data,0);
    } else if (tab == 'sslc') {
    	data=sslccount;
    	showBasicData(tab,data);
    } 
}

function initialise(statusinfo)
{
  schoolcount=statusinfo["schoolcount"];
  schooldistrictkeys=keys(statusinfo["schoolcount"]["children"]).sort();
  preschoolcount=statusinfo["preschoolcount"];
  preschooldistrictkeys=keys(statusinfo["preschoolcount"]["children"]).sort();
  sslccount=statusinfo["sslccount"];
  sslcdistrictkeys=keys(statusinfo["sslccount"]["children"]).sort();
  currentprograms=statusinfo["currentprograms"];
  showAllBasicData(preschoolcount,schoolcount,sslccount);
}

function keys(obj)
{
    var keys = [];
    for(var key in obj)
    {
        if(obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}

function showBasicData(tab, data){
	var content = '<div class="table_header">Counts</div><table class="break_in_mobile">'
	content = content + buildBasicContent(tab,data);
	content = content + '</table>'
	document.getElementById("load_data").innerHTML=content;
}

function showAllBasicData(presch,sch,sslc){
	var content = '<div class="table_header">Counts</div><table class="break_in_mobile">'
	content = content + buildBasicContent('preschool',presch);
	content = content + buildBasicContent('school',sch);
	content = content + buildBasicContent('sslc',sslc);
	content = content + '</table>'
	document.getElementById("load_data").innerHTML=content;
} 

function buildBasicContent (tab, data) {
	var heading = ''
	if (tab == 'preschool')
		heading = 'Pre-School';
	else if (tab == 'school')
		heading = 'School';
	else if (tab == 'sslc') 
		heading = 'Secondary School'
	var content = '<tr><th class="sub_title" colspan="4">' + heading + '</th></tr>'
		+ '<tr><td class="circular_count_item"><p>Active '+ heading + ' Count</p><p class="value">' + data["scount"] +'</p></td>'
	if(tab != 'sslc')
		content = content + '<td class="circular_count_item"><p>Active '+ heading +' with Students Count</p><p class="value">' + data["sstucount"] + '</p></td>'
	else
		content = content + '<td class="circular_count_item"><p>Students who appeared for SSLC</p><p class="value">' + data["stucount"] + '</p></td>'	
	content = content + '<td class="circular_count_item"><p>Active Students Count</p><p class="value">' + data["stucount"] + '</p></td>'
		+ '<td><div class="stats_gender_item boy">'
		+ '<span class="icon png24"></span><p class="label"><span>5400</span> boys</p><p class="value">65%</p>'
		+ '<div class="clr"></div></div>'
		+ '<div class="stats_gender_item girl">'
		+ '<span class="icon png24"></span><p class="label"><span>2700</span> boys</p><p class="value">35%</p>'
		+ '<div class="clr"></div></div></tr>'
	return content
}


function showAssessmentData(incontent,data,depth)
{
    content=incontent+"<br><br>";
    if( depth !==3 )
    {
      content=content+"<table class='table'><caption>Assessment Counts</caption><tr><td>Boundary</td><td>Program Name</td><td>Assess Name</td><td>Schools Mapped</td><td>Schools Assessed</td><td>Student Assessed</td></tr>";
      var asscount=0;
      var bkeys=keys(data["assessmentcount"]).sort();
      for (bkey in bkeys)
      {
        var bname=bkeys[bkey];
        var pkeys=keys(data["assessmentcount"][bname]).sort();
        for (pkey in pkeys)
        {
          var pname=pkeys[pkey];
          var asskeys=keys(data["assessmentcount"][bname][pname]).sort();
          for (akey in asskeys)
          {
             var assname=asskeys[akey];
             asscount=asscount+1;
             content=content+"<tr><td>"+bname+"</td><td>"+pname+"</td><td>"+assname+"</td><td>"+data["assessmentcount"][bname][pname][assname]["smappedcount"]+"</td><td>"+data["assessmentcount"][bname][pname][assname]["sassessedcount"]+"</td><td>"+data["assessmentcount"][bname][pname][assname]["stuassessedcount"]+"</td></tr>";
          }
        }  
      }  
      if(asscount==0)
      {
        content=content+"<tr><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>";
      }
    }
    else
    {
      content=content+"<table class='table'><caption>Assessment Counts</caption><tr><td>Boundary</td><td>Program Name</td><td>Assessment Name</td><td>Student Assessed</td></tr>";
      var asscount=0;
      var bkeys=keys(data["assessmentcount"]).sort();
      for (bkey in bkeys)
      {
        var bname=bkeys[bkey];
        var pkeys=keys(data["assessmentcount"][bname]).sort();
        for (pkey in pkeys)
        {
          var pname=pkeys[pkey];
          var asskeys=keys(data["assessmentcount"][bname][pname]).sort();
          for (akey in asskeys)
          {
             var assname=asskeys[akey];
             asscount=asscount+1;
             content=content+"<tr><td>"+bname+"</td><td>"+pname+"</td><td>"+assname+"</td><td>"+data["assessmentcount"][bname][pname][assname]["stuassessedcount"]+"</td></tr>";
          }
        }  
      }  
      if(asscount==0)
      {
        content=content+"<tr><td>-</td><td>-</td><td>-</td><td>-</td></tr>";
      }
    
    }
    content=content+"</table>";
      
    document.getElementById("load_data").innerHTML=content;
}



function isEmpty(obj) 
{ 
  for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
} 

