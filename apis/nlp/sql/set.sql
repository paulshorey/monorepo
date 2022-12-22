UPDATE crawl.words SET e_sentiment=null,d_sentiment=null,c_sentiment=null,b_sentiment=null,a_sentiment=null,sentiment=null WHERE list_count=0

SELECT key,list_count,list,rs_count,reverse_sources,sources_success,sources_failed,sources FROM crawl.words WHERE rs_count>0 AND list_count > 30

-- SELECT * FROM crawl.words WHERE vrsn<1036 AND (e_sentiment IS NOT NULL) ORDER BY list_count DESC, sources_count DESC LIMIT 100

