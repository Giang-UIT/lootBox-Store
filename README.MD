# This is suppose to be a temporary README


- Delete this if task #54 is completed 

------------------ --------------------

### What are the changes? 
1) All pages are now moved to src/pages
2) new plugins have been added. No clues what Pinia and i18n do, but they won't cause any issue. They are there as options to be used if needed. 

    | plugins|
    | ----------- | 
    | Vuetify |
    | Pinia |
    | i18n |

3) mainpage.vue has been renamed to index.vue and is placed in *"/pages/"*

4) *Pages* is a new folder that will be storing our web pages. The routing was implemented such that all pages will be searched in the folder

- Higly recommend checking out [routing guide](https://vuejs.org/guide/scaling-up/routing.html)


--- 
## *Before running our web application!*

**You have to be in the Frontend folder** to run these commands

1) npm install update 
2) npm install axios (just in case)
3) npm install vuetify (just in case)
4) npm install i18n (just in case)
5) npm install pinia (just in case)

I ran into a problem where the mentioned plugins were not installed. You can install them just to be safe. 