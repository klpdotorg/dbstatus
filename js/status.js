var schoolcount={};
var preschoolcount={};
var sslccount={};
var currentprograms={}
var schooldistrictkeys=[];
var preschooldistrictkeys=[];
var asyncfetch = {};

function initialise(statusinfo)
{
  schoolcount=statusinfo["schoolcount"];
  preschoolcount=statusinfo["preschoolcount"];
  sslccount=statusinfo["sslccount"];
  currentprograms=statusinfo["currentprograms"];
  showAllBasicData(preschoolcount,schoolcount,sslccount);
  
  // Populating the Select boxes
  schooldistrictkeys=idDict(statusinfo["schoolcount"]["children"]);
  preschooldistrictkeys=idDict(statusinfo["preschoolcount"]["children"]);
  sslcdistrictkeys=idDict(statusinfo["sslccount"]["children"]);
  populateSelection("district_select",preschooldistrictkeys);
}

function loadData(tab)
{
  manageTab(tab);
	if (tab == 'preschool') {
		content="<h2>Preschool Counts</h2>";
      data=preschoolcount;
      content = showBasicData(tab,'initialise','');
    	showAssessmentData(content,data,0);
  } else if (tab == 'school') {
      content = "<br><br><h2>School Counts</h2>";
    	data=schoolcount;
    	content = showBasicData(tab,'initialise','');
    	showAssessmentData(content,data,0);
  } else if (tab == 'sslc') {
    	showBasicData(tab,'initialise','');
  } else if (tab == "programmes") {
      showProgrammes();
  }
}

function loadDistrictData(){
  loadBoundaryData("district_select","block_select")
}

function loadBlockData(){
  loadBoundaryData("block_select","cluster_select")
}

function loadClusterData(){
  loadBoundaryData("cluster_select","school_select")
}

function loadSchoolData(){
  loadBoundaryData("school_select","class_select")
}

function loadClassData() {
  loadBoundaryData("class_select","student_select")
}

function loadBoundaryData(selected,sub_select)
{
  var selected_element = document.getElementById(selected);
  var selected_value = selected_element.options[selected_element.selectedIndex].value;
  var name = selected_value.split('|')[0];
  var id = selected_value.split('|')[1];
  var type = selected.split('_')[0];
  var fetch_type = sub_select.split('_')[0]; 
  var tab = getActiveTab();
  if(tab == 'sslc'){
    content = showBasicData(tab,'district',name)
  } else {
    var content;
    content = showBasicData(tab,type,name)
    $.ajax({ 
      type: 'GET', 
      url: "getdata/"+fetch_type+"/"+id,
      dataType: 'json',
      async: false,
      error: function (xhr, status) {
        alert(status);
      },
      success: function (result) {
        asyncfetch[fetch_type] = result;
      }
    });
    if(type != 'class')
      populateSelection(sub_select,idDict(asyncfetch[fetch_type]['children']));
    if(type != 'block' && type !='district')
    {
      if(type == 'class')
        showAssessmentData(content,asyncfetch['class']['children'][name],3); 
      else
        showAssessmentData(content,asyncfetch[fetch_type],3); // 4 column display
    }
    else
      showAssessmentData(content,asyncfetch[fetch_type],0); // 6 column display
  }
}

function showBasicData(tab,type,name){
  var data;
  if (tab == "preschool")
    data = preschoolcount;
  else if (tab == "school")
    data = schoolcount;
  else if (tab == "sslc") {
    data = sslccount;
    if(type == "district")
      data = sslccount['children'][name];
  }
  if (type != "initialise") {
    if (tab != 'sslc' ) {
      if (type != "district") 
        data = asyncfetch[type]['children'][name];
      else 
        data = data["children"][name];
    }
  }

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

function buildBasicContent (tab, data) {
  var heading = ''
	if (tab == 'preschool')
		heading = 'Pre-School';
	else if (tab == 'school')
		heading = 'School';
	else if (tab == 'sslc') 
		heading = 'Secondary School'
	var content = '<tr><th class="sub_title" colspan="4">' + heading + '</th></tr>'
  if(data["scount"] != undefined) {
    content = content + '<tr><td class="circular_count_item"><p>Active '+ heading + ' Count</p><p class="value">' + data["scount"] + '</p></td>'
  }
	if(tab != 'sslc' ) {
    if(data["sstucount"] != undefined) {
		  content = content + '<td class="circular_count_item"><p>Active '+ heading +' with Students Count</p>'
      content = content + '<p class="value">' + data["sstucount"] + '</p></td>'
    }
  }
	else {
		content = content + '<td class="circular_count_item"><p>Students who appeared for SSLC</p><p class="value">' + data["stucount"] + '</p></td>'	
  }
	content = content + '<td class="circular_count_item"><p>Active Students Count</p><p class="value">' + data["stucount"] + '</p></td>'
		+ '<td><div class="stats_gender_item boy">'
		+ '<span class="icon png24"></span><p class="label"><span>' + fixNan(data["boys"]) + '</span> boys</p><p class="value">' + fixNan(Math.floor((data["boys"] / data["stucount"] * 100))) + '%</p>'
		+ '<div class="clr"></div></div>'
		+ '<div class="stats_gender_item girl">'
		+ '<span class="icon png24"></span><p class="label"><span>' + fixNan(data["girls"]) + '</span> girls</p><p class="value">'+ fixNan(Math.floor((data["girls"] / data["stucount"] * 100))) + '%</p>'
		+ '<div class="clr"></div></div></tr>'
	return content
}


function showAssessmentData(incontent,data,depth)
{
    document.getElementById('load_data').innerHTML ='';
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

    if( depth !==3 )
    {
      content = content + '<th class="sub_title lowercase">Schools Mapped</th>'
        + '<th class="sub_title lowercase">Schools Assessed</th>'
        + '<th class="sub_title lowercase">Students Assessed</th></tr>'
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
        content = content + '<th class="sub_title lowercase">Schools Mapped</th>'
        + '<th class="sub_title lowercase">Schools Assessed</th>'
        + '<th class="sub_title lowercase">Students Assessed</th></tr>'
        content=content+"<tr><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>";
      }
    }
    else
    {
      content = content + '<th class="sub_title lowercase">Students Assessed</th></tr>'
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


function manageTab(tab)
{
  clearSelections();
  activateTab(tab);
  changeLabels(tab);
  document.getElementById("select_panel").style.visibility='visible';
  document.getElementById("block").style.visibility='visible';
  document.getElementById("cluster").style.visibility='visible';
  document.getElementById("school_sel").style.visibility='visible';
  document.getElementById("class_sel").style.visibility='visible';
  if (tab == 'preschool') {
    populateSelection("district_select",preschooldistrictkeys);
  } else if (tab == 'school') {
    populateSelection("district_select",schooldistrictkeys);
  } else if (tab == 'sslc') {
    populateSelection("district_select",sslcdistrictkeys);
    document.getElementById("block").style.visibility='hidden';
    document.getElementById("cluster").style.visibility='hidden';
    document.getElementById("school_sel").style.visibility='hidden';
    document.getElementById("class_sel").style.visibility='hidden';
  } else if (tab == "programmes") {
    document.getElementById("select_panel").style.visibility='hidden';
  }
}

function changeLabels (tab) {
  if(tab == "preschool"){
    var block = document.getElementById("block").innerHTML 
    document.getElementById("block").innerHTML = block.replace("Block","Project");
    var cluster = document.getElementById("cluster").innerHTML 
    document.getElementById("cluster").innerHTML = cluster.replace("Cluster","Circle");
    var school = document.getElementById("school_sel").innerHTML 
    document.getElementById("school_sel").innerHTML = school.replace("School","Preschool");
  } else {
    var block = document.getElementById("block").innerHTML 
    document.getElementById("block").innerHTML = block.replace("Project","Block");
    var cluster = document.getElementById("cluster").innerHTML 
    document.getElementById("cluster").innerHTML = cluster.replace("Circle","Cluster");
    var school = document.getElementById("school_sel").innerHTML 
    document.getElementById("school_sel").innerHTML = school.replace("Preschool","School");
  }
}

function activateTab(tab)
{
  var tabs = ["preschool","school","sslc","programmes"]
  for (var each in tabs) {
    if (tabs[each] != tab)
      document.getElementById(tabs[each]).classList.remove('active');
  }
  document.getElementById(tab).classList.add('active')
}

function getActiveTab()
{
  if (document.getElementById("preschool").classList.contains("active")) return "preschool";
  if (document.getElementById("school").classList.contains('active')) return "school";
  if (document.getElementById("sslc").classList.contains('active')) return "sslc";
  if (document.getElementById("programmes").classList.contains('active')) return "programmes";
}

function populateSelection(element_id,options_dict)
{
  var selected_element = document.getElementById(element_id);
  while(selected_element.options.length > 0){                
    selected_element.remove(0);
  }
  var count=1;
  for( var each in options_dict) {
    selected_element.options[count] = new Option(each.toUpperCase(),each + '|' + options_dict[each]);
    count = count+1;
  }
  sortSelection(element_id);
}

function sortSelection(element_id)
{
  var cl = document.getElementById(element_id);
  var clTexts = new Array();

  for(i = 2; i < cl.length; i++){
    clTexts[i-2] = cl.options[i].text.toUpperCase() + "," +
      cl.options[i].text + "," +
      cl.options[i].value;
  }
 clTexts.sort();

  for(i = 2; i < cl.length; i++){
    var parts = clTexts[i-2].split(',');
    cl.options[i].text = parts[1];
    cl.options[i].value = parts[2];
  }
}

function clearSelections()
{
  var sel_array = ['block','cluster','school_sel'];
  for (var each in sel_array) {
    selection = document.getElementById(sel_array[each]);
    if(selection.options != undefined && selection.options.length > 0) {
      while(selection.options.length > 0) {
        selection.remove(0);
      }
    }
  }
}

function idDict(obj)
{
  var dict = {}
  for (var key in obj)
  {
    if(obj.hasOwnProperty(key)){
      dict[key] = obj[key]["id"];
    }
  }
  return dict;
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

function isEmpty(obj) 
{ 
  for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
} 

function fixNan(val)
{
   if (isNaN(val)) 
     return 0;
   else
     return val;
}
