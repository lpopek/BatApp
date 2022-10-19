import os

##### INPUT DATA #####
pages = 3  ### how many pages from PUBMED should be scraped
begin = 2015 ### year of begnnig of search
end = 2022 ### yer of end of search

dir_of_save = "D:\\STUDIA\\Semestr_12\\ICM\\mgr_icm\\repo\\bat-app\\bat-app-ai\\downloaded_articles"

def main():
    print("[INFO]: Launching searching module")
    exit_code = os.system(f"py async_pubmed_scraper.py --pages {pages} --start {begin} --stop {end}")
    if exit_code:
        print("[INFO]: Launching classification module")
        exit_code = os.system("py classification.py")
    else:
        print("[ERROR]: Aborting process.")
        exit()
    exit_code = 1
    if exit_code:
        print("[INFO]: Launching download module")
        exit_code = os.system(f"py download_articles.py -o {dir_of_save}")
        print("[INFO]: Final Operations")
    else:
        print("[ERROR]: Aborting process.")
        exit()
    

if __name__ == "__main__":
    main()