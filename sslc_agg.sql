drop table tb_sslc_dbstatus_agg;
create table tb_sslc_dbstatus_agg (
        dist_code character varying(3),
        ayid integer,
        is_govt character varying(3),
        sch_count integer,
        girls integer,
        boys integer,
        tot_stu_count integer,
        pass_stu_count integer
);


CREATE OR REPLACE function agg_dbstatus_counts() returns void as $$
declare
  district RECORD;
begin
        for district in
                select distinct dist_code, cast(ayid as int), case when schoolname like '%GOVT%' then 'G' when schoolname like '%CORPORATION%' then 'G' when schoolname like '%GOVERNMENT%' then 'G' else 'N' end as is_govt, count(distinct school_code) as sch_count, count ( case when gender_code='G' then 1 else null end ) as girls, count ( case when gender_code='B' then 1 else null end ) as boys, count(distinct reg_no) as tot_stu_count, sum(case when result='P' then 1 else null end) as pass_stu_count from tb_sslcresults group by dist_code,ayid,is_govt order by dist_code
        loop
                insert into tb_sslc_dbstatus_agg values (district.dist_code,district.ayid,district.is_govt,district.sch_count,district.girls,district.boys,district.tot_stu_count,district.pass_stu_count);
        end loop;
end;
$$ language plpgsql;

select agg_dbstatus_counts();

pg_dump -U klp -t 'tb_district' -t 'tb_sslc_dbstatus_agg' sslcdata > sslc_dataagg.sql

