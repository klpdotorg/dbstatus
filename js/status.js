var schoolcount={};
var preschoolcount={};
var sslccount={};
var currentprograms={}
var schooldistrictkeys=[];
var preschooldistrictkeys=[];


function loadData(tab)
{
  activateLink(tab);
	if (tab == 'preschool') {
		content="<h2>Preschool Counts</h2>";
      data=preschoolcount;
      content = showBasicData(tab,data);
    	showAssessmentData(content,data,0);
    } else if (tab == 'school') {
      content = "<br><br><h2>School Counts</h2>";
    	data=schoolcount;
    	content = showBasicData(tab,data);
    	showAssessmentData(content,data,0);
    } else if (tab == 'sslc') {
      data=sslccount;
    	showBasicData(tab,data);
    } else if (tab == "programmes") {
      showProgrammes();
    }
}

function activateLink(tab)
{
  if (tab == 'preschool') {
    populateSelection("district_select",preschooldistrictkeys);
    document.getElementById("preschool").classList.add('active');
    document.getElementById("school").classList.remove('active');
    document.getElementById("sslc").classList.remove('active');
    document.getElementById("programmes").classList.remove('active');
  } else if (tab == 'school') {
    populateSelection("district_select",schooldistrictkeys);
    document.getElementById("preschool").classList.remove('active');
    document.getElementById("school").classList.add('active');
    document.getElementById("sslc").classList.remove('active');
    document.getElementById("programmes").classList.remove('active');
  } else if (tab == 'sslc') {
    populateSelection("district_select",sslcdistrictkeys);
    document.getElementById("preschool").classList.remove('active');
    document.getElementById("school").classList.remove('active');
    document.getElementById("sslc").classList.add('active');
    document.getElementById("programmes").classList.remove('active');
  } else if (tab == "programmes") {
    document.getElementById("preschool").classList.remove('active');
    document.getElementById("school").classList.remove('active');
    document.getElementById("sslc").classList.remove('active');
    document.getElementById("programmes").classList.add('active');
  }
}

function showProgrammes()
{
  document.getElementById("load_data").innerHTML= '';
  var content = '<div class="table_header non-breakable">Programmes' + '</div>'
  content = content + '<div class="assessment_table_wrapper">'
      + '<table><tr><th class="sub_title lowercase">Current Programmes</th></tr>'
  for(num in currentprograms)
  {
    program=currentprograms[num];
    content=content+"<tr class='tabular_item'><td>"+program+"</td></tr>";
  }
  content=content+"</table></div>"
  document.getElementById("load_data").innerHTML=content;
}

function populateSelection(element_id,options_dict)
{
  var selected_element = document.getElementById(element_id);
  var count=1;
  for( var each in options_dict){
    selected_element.options[count] = new Option(options_dict[each].name,options_dict[each].id);
    count = count+1;
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
  
  // Populating the Select boxes
  schooldistrictkeys=keys(statusinfo["schoolcount"]["children"]).sort();
  preschooldistrictkeys=keys(statusinfo["preschoolcount"]["children"]).sort();
  sslcdistrictkeys=keys(statusinfo["sslccount"]["children"]).sort();
  populateSelection("district_select",preschooldistrictkeys);
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
  return content;
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
    content = incontent;

    content = content + '<div class="table_header non-breakable">Assessment Counts'
      /*+ '<div class="year_selector">'
      + '<div class="selection" onclick="$(this).parent().toggleClass(\'open\');">'
      + '<span class="label">Year:</span> <span class="value png24">2011 - 2012</span></div><ul>'
      + '<li onclick="$(this).parent().parent().toggleClass(\'open\');return false;"><a href="">2010-2011</a></li>'
      + '<li onclick="$(this).parent().parent().toggleClass(\'open\');return false;"><a href="">2011-2012</a></li>'
      + '<li onclick="$(this).parent().parent().toggleClass(\'open\');return false;"><a href="">2012-2013</a></li>'
      + '</ul></div>*/
      + '</div>'
    content = content + '<div class="assessment_table_wrapper"><table><tr>'
      + '<th class="sub_title lowercase">Boundary</th>'
      + '<th class="sub_title lowercase">Program Name</th>'
      + '<th class="sub_title lowercase">Assess Name</th>'
      + '<th class="sub_title lowercase">Schools Mapped</th>'
      + '<th class="sub_title lowercase">Schools Assessed</th>'
      + '<th class="sub_title lowercase">Students Assessed</th></tr>'
    if( depth !==3 )
    {
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
             content=content+"<tr class='tabular_item'><td>"+bname+"</td><td>"+pname+"</td><td>"+assname+"</td><td>"+data["assessmentcount"][bname][pname][assname]["smappedcount"]+"</td><td>"+data["assessmentcount"][bname][pname][assname]["sassessedcount"]+"</td><td>"+data["assessmentcount"][bname][pname][assname]["stuassessedcount"]+"</td></tr>";
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
             content=content+"<tr class='tabular_item'><td>"+bname+"</td><td>"+pname+"</td><td>"+assname+"</td><td>"+data["assessmentcount"][bname][pname][assname]["stuassessedcount"]+"</td></tr>";
          }
        }  
      }  
      if(asscount==0)
      {
        content=content+"<tr class='tabular_item'><td>-</td><td>-</td><td>-</td><td>-</td></tr>";
      }
    
    }
    content=content+"</table></div>";
      
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

