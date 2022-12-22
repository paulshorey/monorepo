-- UPDATE crawl.words SET success_sources_count=10 WHERE success_sources_count>10;
-- DELETE FROM crawl.words WHERE word='john muir';
-- INSERT INTO crawl.words (word, attempts, timestamp, vrsn) VALUES ('john muir', 0, 1608654386421, 40);
SELECT * FROM crawl.words WHERE word='callously';
-- UPDATE crawl.words SET attempts=1 WHERE attempts=10;
-- SELECT * FROM crawl.words WHERE attempts<99 AND attempts>1;

--UPDATE data.words SET key='ios' WHERE str='iOS';
--
--UPDATE data.words SET str='Coronavirus' WHERE key='coronavirus';
--UPDATE data.words SET str='Covid-19' WHERE key='covid19';
--UPDATE data.words SET str='Covid' WHERE key='covid';
--UPDATE data.words SET str='Nascar' WHERE key='nascar';
--UPDATE data.words SET str='Shabu Shabu' WHERE key='shabushabu';
