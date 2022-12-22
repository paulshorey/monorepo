SELECT rating,char_count,space_count,key,reverse_sources,rs_count,attempts FROM crawl.words WHERE 

list_count IS NULL AND reverse_sources IS NULL AND attempts<2 AND (error IS NULL OR error='') AND char_count > 4

-- AND ((space_count=2 AND char_count <= 18) OR (space_count=1 AND char_count<=12) OR (space_count=0 AND char_count<=9))

ORDER BY rating DESC LIMIT 500

SELECT key,attempts,list_count,list,results,sources,reverse_sources,rs_count,rating,error,vrsn,e_sentiment,sentiment FROM crawl.words WHERE attempts=-1 AND list_count IS NULL ORDER BY list_count DESC LIMIT 500

SELECT key,list_count,reverse_sources,rs_count,rating FROM crawl.words WHERE list_count>0 AND e_sentiment IS NULL ORDER BY list_count DESC, rating DESC LIMIT 500

SELECT key,list_count,reverse_sources,rs_count FROM crawl.words WHERE (reverse_sources IS NOT NULL AND reverse_sources!='{}') AND rs_count IS NULL ORDER BY rating DESC, space_count ASC LIMIT 5

SELECT key,list_count,list,rs_count,reverse_sources,sources_success,sources_failed,sources FROM crawl.words WHERE list_count>0 AND (best='' OR list='[]' OR list IS NULL) ORDER BY timestamp ASC LIMIT 500