  
## ROOT  
maybe find API? Does WordsAPI have root?  
for multi-words, root/singularize/pluralize only last noun.  
  
## SPELL CHECK  
if Microsoft transforms word, same as existing word,  
    merge two word results, preferring original (not transformed) row  
  
## SENTIMENT SCORE  
  
## WIKTIONARY  
analyze if it's a abbreviation "LED" or not  
  
  
  
## IF NO KW.LIST  
perhaps take first of each pos from dataMuse_ml  
  
  
  
## RATE EACH KEY, TO OPTIMIZE CRAWLING  
  
0-40 = sources_success * 4  
-5 for each space  
-1 for each character after 7  
  
2-word with 4 sources = 16 - 5 = 11  
3-word with 4 sources = 16 - 10 = 6  
  
minimum 2 if 3 sources success  
minimum 1 if 2 sources success  
minimum 0  
  
  
  
  
# AFTER ALL WORDS ARE DOWNLOADED  
  
## FILTER  
  
    * if /synonym/([a-z]+) in other synonym,  
        remove the synonym (fragment), leaving the other (longer word)  
        ("char" > "charwoman" / "pitch" > "pitchdark")  
  
    * if match /keyword\ / in any synonym,  
        remove the synonym (phrase), leaving the other (single word)  
        ("irish whiskey" > "whiskey" / "irish people" > "people")  
  
    * if > 85 % sure it's different POS, move to that pos, re-count posCounts  
            if phrase, and not found, indecisive, check last word in phrase "northern ireland" > "ireland"  
  
## FILTER  
  
    * KEEP EVERYTHING EXCEPT 10s for wordbreakalgorithm  
  
    * WHERE 6-9 sources_failed AND !!translated  
        IF translated result is better and <7 failed, replace with translated word,  
            (for example, "haus"! 9 failed, but "house" is great word)  
            ("dat" 6 failed, translates to "which")  
        IF translated result is >=7 failed and word is >=7 failed,  
            throw out the word.  
            ("noo")  
        WHAT ABOUT "nra"?  
            (It has 7 failed, and translation, but is an important American word with great .domains suggestions)  
  
    * delete WHERE 9-10 sources_failed  
  
    * delete WHERE 7-8 sources_failed AND < 90 results_pos_count OR < 25 results_list_count  
  
    * delete WHERE 6-10 sources_failed AND word has less than 4 characters  
  
## SORT EACH RESULT  
  
    * check each root/singular/plural, if it has very low score, remove! make NULL  
        dont know about treshold. Maybe if  
            row.singular<=2 ||  
            (row.singluar==3||4) && (results_pos<50 || results_list<20)  
            row.singular==3 && row.alt has success 5 higher than singular  
        perhaps check if singular/plural/root shares any synonyms with keyword  
  
    * if currentWord has .root, rootWord.derivation=currentWord.word  
        if rootWord already has .derivation, then replace only if currentWord.word is longer  
  
    * idk HOW TO FILTER OUT stopwords like "says", which do not show in the most common stopwords?  
  
    * remove common stopwords from each array  
  
    * remove before/after words from list/posList, one by one, upto 10  
  
    * if definite noun/verb/adj, combine (sort) pos results into list  
  
    * remove common person names  
  
    * remove words from each array which do not have a database entry  
  
        * update kw.posCount___ (subtract from current counts - maybe subtract two for each removed, as penalty)  
  
    * add posTagGroupEtc categories: prepositions, conjugations, exclamations, etc  
  
    * redo/fix kw.domains from all kw.ratings words (first 2700 crawled are broken)  
  
        * rethink strategy to get single/plural/root, and remove prefix/suffix  
  
    * add highest_rating to database (for future manual comparison, or automatic cleanup)  
  
    * if only 1 sourceSuccess, check if it is open-source (dataMuse), otherwise add flag DONOTUSE  
  
    * if too many domain results, sort/limit domains by kw.ratings[domain]  
  
    * remove words from list/pos if they appear in before/after  
  
    * compile list of common person names (not like Jesus or Washington, but like Amy or Wesley)  
    and remove them from any suggestions  
  
## FILTER DATABASE AGAIN  
  
    * delete WHERE if < 15 results_list_count or < 60 results_pos_count  
  
## SORT AGAIN  
  
    * concat domains from kw.root, first kw.list, and maybe kw.highestRated  
  
    * for each kw.posList.etc,  
  
        * fetch its .pos, sort into correct .posList, re-count .posCounts/.pos of kw  
  
    * find domain hacks like "ly"  
        for .ly, check if it can be an ending for current word or any of its suggestions,  
        OR if there is a word+"ly" entry in the database for current word or any of its suggestions  
        (if $adjective, and ends in "le", remove "le" first before looking)  
        repeat for:  
        .me  
        .ng  
        .etc  
    * for every domain, see if it fits into the end of the word, its root, its plural, or synonyms  
        .press  
  
## RE-SORT AGAIN AGAIN  
  
    * fix kw.pos discrepancy between kw.pos and kw.posTagGroup, now that we have most correct kw.pos  
  
        * (see below for brainstormed logic)  
  
## GET POS  
```  
if (  
    ( kw.posVerbsCount > 0.5*kw.posCount ) ||  
    ( kw.pos === kw.posTagGroup )  
) {  
    // Easy! Replace kw.list with kw.posList.verbs  
} else {  
    // What to do if mis-match ??  
    if (  
        kw.posTagGroup  
    ) {  
        // Then it's a combination of nouns/verbs/adj  
        // Mix kw.list out of each list, by percentage,  
        // (throw in some .etc words?)  
    } else {  
        // Ohoh, it's neither a noun or verb or adj!  
        // Keep kw.list as is  
    }  
}  
```  
  
## ENTITY DETECTION  
  
    * consider word "ales" faile_sources=7 and considered "foreign word" because translated by Google  
        words like this must be kept and used, though perhaps not preferred... continue to "ale"  
  
    * thee (8 failed) the (7 failed)  
        8 sources failed == garbage word  
        7 sources failed == acceptable word  
        5 sources failed == good word  
  
## FURTHER CLEANING (TO NOT OFFEND ANY USERS)  
  
    * create "clean crawler" script, which omits dataMuse rel and ignores bad/dirty/sexist/racist words  
        then whenever find or think of a word with problematic results, manually run it through this cleaner api  
