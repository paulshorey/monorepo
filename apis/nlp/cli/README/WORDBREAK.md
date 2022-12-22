### Notes:  
    4+ success == good results! Ex: "delish"  
  
### What to do about?...  
    trace + ability  
  
### Small Morphemes  
    * always prefer 1-st level of words. Be very skeptical about 2nd level if short string, or 3rd level if long string.  
        the longer the original string, the more open we can be with including level-2-3 words  
        don't use "de"+"struct" and "in"+"struct" if "destruct" and "instruct" already have good meaning  
        perhaps length does not matter  
        "iselfdestruct" does not already have good meaning,  
        so continue breaking it down to "i" "selfdestruct" "self" "desctruct"  
  
    * 4-letter morphemes are great!  
        in "selfdestruct", "self" and "desctruct" both have good meaning  
        "auto"+"destruct" is a weird rare one. I'm ok with it wrongly using vehicle meanings this once.  
  
    * 3-letter morphemes?  
        "sub"+"structure"  
        "con"+"struct"  
        perhaps useful for word-break, but discard 3-letter word, and keep only following words  
  
        "cat"+"in"+"the"+"hat"  
        actually, never mind, just rely on stopwords to filter out meaningless 3-letter words  
        same with prefixes/suffixes/middles  
  
    * 2-letter prefixes are bad! Don't bother!  
        (stop at 3 letters when wordbreaking right->left)  
        in "de" "struct", we do not trust the "de" because it is only 2, so ignore "struct" also !  
        they usually alter meaning of the root word, and neither it or the root word can stand on their own  
        both "in" "struct" will individually have bad meaning  
        "in"+"capable", "de"+"moralizing", "re"+"act"  
  
    * 2-letter suffixes are great (like "ed", "er", "es", "ly"),  
        but discard them (should be in stopwords)  
  
    * 2-letter words in middle (in, an, or) are good for wordbreak, and will usually be caught by stopwords  
  
    * 1-letter words  
        "a -"  
        "I" - rest of the string would have to be un-broken trustworthy words (don't accept if rest is incomplete)  
  
    * 1-letter prefixes  
        "a", "i" as in "iCloud"  
  
    * 1-letter suffixes  
        "s", "y"  
  
    Perhaps don't crawl every letter, but only specific letters, manually compiled for beginning/end cases  
  
### Small Morphemes ~ Lesson learned:  
    When compiling stopwords, keep as many 2-letter, 3-letter as possible!  
    Those will be most useful to filter out suffixes and conjunctions.  
    Use stopwords for wordbreak, with score of 1, then discard before translating.  
  
# 1  
## spongebobsquarepants:  
#### sponge, bob, square, pants  
```  
sponge (10)  
spon (1) ignored  
        bobs (4) nothing further found  
        bob (10)  
        bo (4) nothing further found  
                square (10)  
                        pants (10)  
```  
matched every character of query! stop searching. otherwise, would have continued to:  
  
#### sponge, bob, square, pants  
```  
spon (1) ignored  
        bo (4)  
                        pant (10)  
```  
  
# 2  
## disenchantment:  
#### disenchant, enchantment  
```  
disenchant (9)  
        me (10) ignore 2-letters if already have 1st-level meaning  
```  
did not match every character of the query. continue backwards:  
```  
enchantment (10)  
        dis (2) ignore  
        is (5) ignore because stopword  
        i (7) gotta make some logic to ignore "I" if in middle and surrounded by obvious non-words  
```  
  
# 3  
## carteblanchejazzband:  
#### carteblanche, carte, blanche(white), jazz, band  
```  
carteblanche (1) - carte (7), blanche (1-10=5)  
        jazz (9)  
                band (10)  
```  
matched every character of query! stop searching. otherwise, would have continued to:  
  
#### carte, blanche, carte, blanche(white), jazz, band  
```  
carte (7)  
        blanche (1) (translated to white (10))  
                jazz (9)  
                        band (10)  
```  
  
# 4  
## carte blanche jazz band:  
#### "carte blanche", jazz, band  
```  
carte blanche (3)  
        jazz (9)  
                band (10)  
                                        * total = 22  
```  
matched every character of query! stop searching. otherwise, would have continued to:  
  
#### "carte blanche", carte, blanche, jazz, band  
```  
carte (7)  
        blanche (1) (translated to white (10))  
                jazz (9)  
                        band (10)  
```  
matched every character of query! stop searching. otherwise, would have continued to:  
  
#### "carte blanche", carte, blanche, jazz, band, cart, blanc, ban  
```  
cart (10)  
        blanc (2) (translated to white (10))  
                        ban (10)  
```  
