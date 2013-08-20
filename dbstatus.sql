-- Schema creation script for aksharas db status

-- This code is released under the terms of the GNU GPL v3 
-- and is free software



DROP TABLE IF EXISTS "tb_boundary_schoolcount" cascade;
CREATE TABLE "tb_boundary_schoolcount" (
  "id" integer,
  "count" integer
);

DROP TABLE IF EXISTS "tb_boundary_studentcount" cascade;
CREATE TABLE "tb_boundary_studentcount" (
  "id" integer,
  "scount" integer,
  "stucount" integer
);

DROP TABLE IF EXISTS "tb_boundary_assessmentcount" cascade;
CREATE TABLE "tb_boundary_assessmentcount" (
  "id" integer,
  "progname" varchar(300) NOT NULL,
  "assessname" varchar(300) NOT NULL,
  "school_mapped_count" integer,
  "school_assess_count" integer,
  "student_assess_count" integer
);

DROP TABLE IF EXISTS "tb_schoolstudentcount" cascade;
CREATE TABLE "tb_schoolstudentcount" (
  "id" integer,
  "studentcount" integer
);


DROP TABLE IF EXISTS "tb_classstudentcount" cascade;
CREATE TABLE "tb_classstudentcount" (
  "id" integer,
  "sid" integer,
  "class" varchar(20),
  "section" varchar(10),
  "studentcount" integer
);

DROP TABLE IF EXISTS "tb_currentprograms" cascade;
CREATE TABLE "tb_currentprograms" (
  "progname" varchar(300) NOT NULL
);

DROP TABLE IF EXISTS "tb_schoolassessmentcount" cascade;
CREATE TABLE "tb_schoolassessmentcount" (
  "id" integer,
  "progname" varchar(300) NOT NULL,
  "assessname" varchar(300) NOT NULL,
  "student_assess_count" integer
);

DROP TABLE IF EXISTS "tb_classassessmentcount" cascade;
CREATE TABLE "tb_classassessmentcount" (
  "id" integer,
  "sid" integer,
  "class" varchar(20),
  "section" varchar(10),
  "progname" varchar(300) NOT NULL,
  "assessname" varchar(300) NOT NULL,
  "student_assess_count" integer
);

DROP TABLE IF EXISTS "tb_statusinfo"cascade;
CREATE TABLE "tb_statusinfo"(
  "updatedtime" timestamp 
);



CREATE OR REPLACE VIEW vw_boundary as
       select * from dblink('host=localhost dbname=klp_production user=klprepl password=password', 'select * from schools_boundary')
       as t1 (id integer,
              parent_id integer,
              name varchar(300),
              boundary_category_id integer,
              boundary_type_id integer,
              active integer);

CREATE OR REPLACE VIEW vw_school as
       select * from dblink('host=localhost dbname=klp_production user=klprepl password=password', 'select id,boundary_id,name,cat_id from schools_institution')
       as t1 (id integer,
              boundary_id integer,
              name varchar(300),
              cat_id integer);

CREATE OR REPLACE VIEW vw_sslc_sch_agg as
       select * from dblink('host=localhost dbname=sslc_dataagg user=klp password=password','select dist.dist_name,agg.ayid,agg.is_govt,agg.moi,agg.sch_count,agg.tot_stu_count,agg.pass_stu_count from tb_sslc_sch_agg agg,tb_district dist where agg.dist_code=dist.dist_code and agg.ayid=102')
       as t1 (district varchar(32),
              ayid integer,
              is_govt varchar(3),
              moi varchar(3),
              sch_count integer,
              tot_stu_count integer,
              pass_stu_count integer);
