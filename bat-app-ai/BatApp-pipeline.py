import os, argparse

# ##### INPUT DATA #####
# pages = 3  ### how many pages from PUBMED should be scraped
# begin = 2015 ### year of begnnig of search
# end = 2022 ### yer of end of search
# dir_of_save = "D:\\STUDIA\\Semestr_12\\ICM\\mgr_icm\\repo\\bat-app\\bat-app-ai\\downloaded_articles"

def main(begin, end, pages, dir_of_save):
    print(begin, end, pages, dir_of_save)
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
    parser = argparse.ArgumentParser(description='Asynchronous PubMed Scraper')
    parser.add_argument('--pages', type=int, default=None, help='Specify number of pages to scrape for EACH keyword. Each page of PubMed results contains 10 articles. \n Default = all pages returned for all keywords.')
    parser.add_argument('--start', type=int, default=2019, help='Specify start year for publication date range to scrape. Default = 2019')
    parser.add_argument('--stop', type=int, default=2020, help='Specify stop year for publication date range to scrape. Default = 2020')
    parser.add_argument('--dir', type=str, default= os.getcwd(), help='Specify dir to save. Default current dir')
    args = parser.parse_args()
    main(args.start, args.stop, args.pages, args.dir)