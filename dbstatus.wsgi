import web
import psycopg2
import decimal
import jsonpickle
import csv
import re
from web import form
from dateutil import parser as dateparser
import smtplib,email,email.encoders,email.mime.text,email.mime.base,mimetypes


db=web.database(dbn='postgres',user='klp',pw='password',db='dbstatus')
# Needed to find the templates
import sys, os,traceback
abspath = os.path.dirname(__file__)
sys.path.append(abspath)
os.chdir(abspath)

from Utility import KLPDB


urls = (
     '/','getstatus',
     '/getdata/(.*)/(.*)','getData'
)


class DbManager:

  con = None
  cursor = None

  @classmethod
  def getMainCon(cls):
    if cls.con and cls.con.closed==0:
      pass
    else:
      cls.con = KLPDB.getConnection()
    return cls.con
 
  def closeConnection(cls):
    cls.con.close()


def sendMail(body,file=None):
    to = ['shivangi@klp.org.in']
    subject = 'Dbstaus errror occured'
    sender = ConfigReader.getConfigValue('Mail','senderid')
    senderpwd = ConfigReader.getConfigValue('Mail','senderpwd')
    smtpport = ConfigReader.getConfigValue('Mail','smtpport')
    smtpserver = ConfigReader.getConfigValue('Mail','smtpserver')

    # create html email
    html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" '
    html +='"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml">'
    html +='<body style="font-size:14px;font-family:Verdana"><p>' + body + '</p>'
    html += "</body></html>"

    emailMsg = email.MIMEMultipart.MIMEMultipart('alternative')
    emailMsg['Subject'] = subject
    emailMsg['From'] = sender
    emailMsg['To'] = ', '.join(to)
    emailMsg.attach(email.mime.text.MIMEText(html,'html'))

    if file != None:
      ctype, encoding = mimetypes.guess_type(file)

      if ctype is None or encoding is not None:
        ctype = 'application/octet-stream'
        maintype, subtype = ctype.split('/', 1)
        fp = open(file)
        fileMsg = email.mime.text.MIMEText(fp.read(), _subtype=subtype)
        fp.close()
        email.encoders.encode_base64(fileMsg)
        fileMsg.add_header('Content-Disposition','attachment;filename='+file.lstrip(filedir))
        emailMsg.attach(fileMsg)

    '''server = smtplib.SMTP(smtpserver,smtpport)
    server.ehlo()
    server.starttls()
    server.ehlo
    server.login(sender,senderpwd)
    server.sendmail(sender,to,emailMsg.as_string())
    server.close()'''



statements = {"district_boundarycounts":"select b.name as name,bs.id as id,bs.count as scount,bstu.scount as sstucount,bstu.stucount as stucount,bass.progname as progname,bass.assessname as assessname,bass.school_mapped_count as smappedcount,bass.school_assess_count as sassessedcount,bass.student_assess_count as stuassessedcount from tb_boundary_schoolcount bs left outer join tb_boundary_studentcount bstu on (bs.id=bstu.id) left outer join tb_boundary_assessmentcount bass on (bs.id=bass.id),vw_boundary b where bs.id=b.id and b.boundary_category_id=$id",
"block_boundarycounts":"select b2.name as b2name,b1.name as name,bs.id as id,bs.count as scount,bstu.scount as sstucount,bstu.stucount as stucount,bass.progname as progname,bass.assessname as assessname,bass.school_mapped_count as smappedcount,bass.school_assess_count as sassessedcount,bass.student_assess_count as stuassessedcount from tb_boundary_schoolcount bs left outer join tb_boundary_studentcount bstu on (bs.id=bstu.id) left outer join tb_boundary_assessmentcount bass on (bs.id=bass.id),vw_boundary b1 ,vw_boundary b2 where bs.id=b1.id and b1.parent_id=b2.id and b2.id=$id",
"cluster_boundarycounts":"select b2.name as b2name,b1.name as b1name,b.name as bname,bs.id as id,bs.count as scount,bstu.scount as sstucount,bstu.stucount as stucount,bass.progname as progname,bass.assessname as assessname,bass.school_mapped_count as smappedcount,bass.school_assess_count as sassessedcount,bass.student_assess_count as stuassessedcount from tb_boundary_schoolcount bs left outer join tb_boundary_studentcount bstu on (bs.id=bstu.id) left outer join tb_boundary_assessmentcount bass on (bs.id=bass.id),vw_boundary b,vw_boundary b1 ,vw_boundary b2 where bs.id=b.id and b.parent_id=b1.id and b1.parent_id=b2.id and b1.id=$id",
               "schoolcounts":"select b2.name as b2name,b1.name as b1name,b.name as bname,s.name as sname,sstu.id as id,sstu.studentcount as stucount,sass.progname as progname,sass.assessname as assessname,sass.student_assess_count as stuassessedcount from tb_schoolstudentcount sstu left outer join tb_schoolassessmentcount sass on (sstu.id=sass.id), vw_boundary b,vw_boundary b1, vw_boundary b2,vw_school s where sstu.id=s.id and s.boundary_id=b.id and b.parent_id=b1.id and b1.parent_id=b2.id and b.id=$id",
               "classcounts":"select b2.name as b2name,b1.name as b1name,b.name as bname,s.name as sname,ARRAY_TO_STRING(ARRAY[cstu.class,cstu.section],' ') as name,cstu.id as id,cstu.studentcount as stucount,cass.progname as progname,cass.assessname as assessname,cass.student_assess_count as stuassessedcount from tb_classstudentcount cstu left outer join tb_classassessmentcount cass on (cstu.id=cass.id), vw_boundary b,vw_boundary b1,vw_boundary b2,vw_school s where cstu.sid=s.id and s.boundary_id=b.id and b.parent_id=b1.id and b1.parent_id=b2.id and s.id=$id",
            "currentprograms":"select * from tb_currentprograms order by progname",
            "sslc_counts":"select distinct district as district,sum(sch_count) as schcount,sum(tot_stu_count) stucount from vw_sslc_sch_agg group by district",
}
render_plain = web.template.render('templates/')

application = web.application(urls,globals()).wsgifunc()


def convertNone(value):
  if value==None: 
    return 0
  else:
    return value

class getstatus:
  def __init__(self):
    self.schoolcount={"scount":0,"stucount":0,"sstucount":0,"assessmentcount":{},"children":{}}
    self.preschoolcount={"scount":0,"stucount":0,"sstucount":0,"assessmentcount":{},"children":{}}
    self.currentprograms=[]
    self.sslccount={"scount":0,"stucount":0,"children":{}}
    self.updatedtime=""
  def getDistrictData(self,result,datacount):
      for row in result:
        name=str(row["name"])
        id=row["id"]
        scount=convertNone(row["scount"])
        sstucount=convertNone(row["sstucount"])
        stucount=convertNone(row["stucount"])
        progname=str(row["progname"])
        assessname=str(row["assessname"])
        smappedcount=convertNone(row["smappedcount"])
        sassessedcount=convertNone(row["sassessedcount"])
        stuassessedcount=convertNone(row["stuassessedcount"])

        if progname !="None" and assessname!="None":
          if name in datacount["assessmentcount"]:
            if progname in datacount["assessmentcount"][name]:
              if assessname in datacount["assessmentcount"][name][progname]:
                datacount["assessmentcount"][name][progname][assessname]["smappedcount"]=datacount["assessmentcount"][name][progname][assessname]["smappedcount"]+smappedcount
                datacount["assessmentcount"][name][progname][assessname]["sassessedcount"]=datacount["assessmentcount"][name][progname][assessname]["sassessedcount"]+sassessedcount
                datacount["assessmentcount"][name][progname][assessname]["stuassessedcount"]=datacount["assessmentcount"][name][progname][assessname]["stuassessedcount"]+stuassessedcount
              else:
                datacount["assessmentcount"][name][progname][assessname]={"stuassessedcount":stuassessedcount,"sassessedcount":sassessedcount,"smappedcount":smappedcount}
            else:
              datacount["assessmentcount"][name][progname]={assessname:{"stuassessedcount":stuassessedcount,"sassessedcount":sassessedcount,"smappedcount":smappedcount}}
          else:
            datacount["assessmentcount"][name]={progname:{assessname:{"stuassessedcount":stuassessedcount,"sassessedcount":sassessedcount,"smappedcount":smappedcount}}}

          if name not in datacount["children"]:
            datacount["children"][name]={"id":id,"name":name,"scount":scount,"sstucount":sstucount,"stucount":stucount,"assessmentcount":{},"children":{}}
            datacount["scount"]=datacount["scount"]+scount
            datacount["sstucount"]=datacount["sstucount"]+sstucount
            datacount["stucount"]=datacount["stucount"]+stucount
        else:
            if name not in datacount["children"]:
              datacount["children"][name]={"id":id,"name":name,"scount":scount,"sstucount":sstucount,"stucount":stucount,"assessmentcount":{},"children":{}}
            datacount["scount"]=datacount["scount"]+scount
            datacount["sstucount"]=datacount["sstucount"]+sstucount
            datacount["stucount"]=datacount["stucount"]+stucount
     
      
  def GET(self):
    try:
      result=db.query(statements["district_boundarycounts"],vars={'id':9})
      self.getDistrictData(result,self.schoolcount)

      result=db.query(statements["district_boundarycounts"],vars={'id':13})
      self.getDistrictData(result,self.preschoolcount)


      result=db.query(statements["sslc_counts"])
      for row in result:
        self.sslccount["scount"]=self.sslccount["scount"]+int(row["schcount"])
        self.sslccount["stucount"]=self.sslccount["stucount"]+int(row["stucount"])
        self.sslccount["children"][str(row["district"])]={}
        self.sslccount["children"][str(row["district"])]["name"]=str(row["district"])
        self.sslccount["children"][str(row["district"])]["scount"]=int(row["schcount"])
        self.sslccount["children"][str(row["district"])]["stucount"]=int(row["stucount"])

      result=db.query(statements["currentprograms"])
      for row in result:
        self.currentprograms.append(str(row["progname"]))

      result=db.query("select to_char(updatedtime,'yyyy-mm-dd HH24:MI:SS') as updateddate from tb_statusinfo")
      for row in result:
        date = dateparser.parse(row["updateddate"])
        self.updatedtime=date.strftime('%d %h %Y')

    except:
      traceback.print_exc(file=sys.stderr)
      sendMail("Got an error")


    statusinfo={"schoolcount":self.schoolcount,"preschoolcount":self.preschoolcount,"currentprograms":self.currentprograms,"updatedtime":self.updatedtime,"sslccount":self.sslccount}


    web.header('Content-Type','text/html; charset=utf-8')
    return render_plain.status(statusinfo)


class getData:
  def GET(self,type,pid):
    try:
      data={"assessmentcount":{},"children":{}}
      if type=="block":
        result=db.query(statements["block_boundarycounts"],vars={'id':pid})
        for row in result:
          name=str(row["name"])
          id=row["id"]
          scount=convertNone(row["scount"])
          sstucount=convertNone(row["sstucount"])
          stucount=convertNone(row["stucount"])
          progname=str(row["progname"])
          assessname=str(row["assessname"])
          smappedcount=convertNone(row["smappedcount"])
          sassessedcount=convertNone(row["sassessedcount"])
          stuassessedcount=convertNone(row["stuassessedcount"])

          if progname !="None" and assessname!="None":
            if name in data["assessmentcount"]:
              if progname in data["assessmentcount"][name]:
                data["assessmentcount"][name][progname][assessname]={"smappedcount":smappedcount,"sassessedcount":sassessedcount,"stuassessedcount":stuassessedcount}
              else:
                data["assessmentcount"][name][progname]={assessname:{"smappedcount":smappedcount,"sassessedcount":sassessedcount,"stuassessedcount":stuassessedcount}}
            else:
              data["assessmentcount"][name]={progname:{assessname:{"smappedcount":smappedcount,"sassessedcount":sassessedcount,"stuassessedcount":stuassessedcount}}}
            if name not in data["children"]:
               data["children"][name]={"id":id,"name":name,"scount":scount,"sstucount":sstucount,"stucount":stucount,"assessmentcount":{},"children":{}}
          else:
            if name not in data["children"]:
               data["children"][name]={"id":id,"name":name,"scount":scount,"sstucount":sstucount,"stucount":stucount,"assessmentcount":{},"children":{}}

      elif type=="cluster":
        result=db.query(statements["cluster_boundarycounts"],vars={'id':pid})
        for row in result:
          district=str(row["b2name"])
          block=str(row["b1name"])
          cluster=str(row["bname"])
          name=str(row["bname"])
          id=row["id"]
          scount=convertNone(row["scount"])
          sstucount=convertNone(row["sstucount"])
          stucount=convertNone(row["stucount"])
          progname=str(row["progname"])
          assessname=str(row["assessname"])
          smappedcount=convertNone(row["smappedcount"])
          sassessedcount=convertNone(row["sassessedcount"])
          stuassessedcount=convertNone(row["stuassessedcount"])

          if progname!="None" and assessname!="None":
            if name in data["assessmentcount"]:
              if progname in data["assessmentcount"][name]:
                data["assessmentcount"][name][progname][assessname]={"smappedcount":smappedcount,"sassessedcount":sassessedcount,"stuassessedcount":stuassessedcount}
              else:
                data["assessmentcount"][name][progname]={assessname:{"smappedcount":smappedcount,"sassessedcount":sassessedcount,"stuassessedcount":stuassessedcount}}
            else:
              data["assessmentcount"][name]={progname:{assessname:{"smappedcount":smappedcount,"sassessedcount":sassessedcount,"stuassessedcount":stuassessedcount}}}
            if name not in data["children"]:
               data["children"][name]={"id":id,"name":name,"scount":scount,"sstucount":sstucount,"stucount":stucount,"assessmentcount":{},"children":{}}
          else:
            if name not in data["children"]:
               data["children"][name]={"id":id,"name":name,"scount":scount,"sstucount":sstucount,"stucount":stucount,"assessmentcount":{},"children":{}}


      elif type=="school":
        result=db.query(statements["schoolcounts"],vars={'id':pid});
        for row in result:
          district=str(row["b2name"])
          block=str(row["b1name"])
          cluster=str(row["bname"])
          name=str(row["sname"])
          id=row["id"]
          stucount=convertNone(row["stucount"])
          progname=str(row["progname"])
          assessname=str(row["assessname"])
          stuassessedcount=convertNone(row["stuassessedcount"])
  
          if progname!="None" and assessname!="None":
            if name in data["assessmentcount"]:
              if progname in data["assessmentcount"][name]:
               data["assessmentcount"][name][progname][assessname]={"stuassessedcount":stuassessedcount}
              else:
                data["assessmentcount"][name][progname]={assessname:{"stuassessedcount":stuassessedcount}}
            else:
              data["assessmentcount"][name]={progname:{assessname:{"stuassessedcount":stuassessedcount}}}
            if name not in data["children"]:
               data["children"][name]={"id":id,"name":name,"stucount":stucount,"assessmentcount":{},"children":{}}
          else:
            if name not in data["children"]:
               data["children"][name]={"id":id,"name":name,"stucount":stucount,"assessmentcount":{},"children":{}}


      elif type=="class":
        result=db.query(statements["classcounts"],vars={'id':pid})
        for row in result:
          data["name"]=str(row["name"])
          district=str(row["b2name"])
          block=str(row["b1name"])
          cluster=str(row["bname"])
          sid=str(row["sname"])
          name=str(row["name"])
          id=row["id"]
          stucount=convertNone(row["stucount"])
          progname=str(row["progname"])
          assessname=str(row["assessname"])
          stuassessedcount=convertNone(row["stuassessedcount"])
  
          if progname!="None" and assessname!="None":
            if name in data["assessmentcount"]:
              if progname in data["assessmentcount"][name]:
               data["assessmentcount"][name][progname][assessname]={"stuassessedcount":stuassessedcount}
               data["children"][name]["assessmentcount"][name][progname][assessname]={"stuassessedcount":stuassessedcount}
              else:
                data["assessmentcount"][name][progname]={assessname:{"stuassessedcount":stuassessedcount}}
                data["children"][name]["assessmentcount"][name][progname]={assessname:{"stuassessedcount":stuassessedcount}}
            else:
              data["assessmentcount"][name]={progname:{assessname:{"stuassessedcount":stuassessedcount}}}
              data["children"][name]={"id":id,"name":name,"stucount":stucount,"assessmentcount":{name:{progname:{assessname:{"stuassessedcount":stuassessedcount}}}},"children":{}}
          else:
            if name not in data["children"]:
               data["children"][name]={"id":id,"name":name,"stucount":stucount,"assessmentcount":{},"children":{}}


    except:
      traceback.print_exc(file=sys.stderr)
      sendMail("Got an error")


    web.header('Content-Type','application/json')
    return jsonpickle.encode(data)


class ConfigReader:

  @staticmethod
  def getConfigValue(section,key):
    from ConfigParser import SafeConfigParser
    try:
      config = SafeConfigParser()
      config_fp = open(os.path.join(os.getcwd(),'config/klpconfig.ini'),'r')
      config.readfp(config_fp)
      value = config.get(section,key)
      config_fp.close()
      return value
    except:
      print "Unexpected error:", sys.exc_info()
      print "Exception in user code:"
      print '-'*60
      traceback.print_exc(file=sys.stdout)
      print '-'*60



