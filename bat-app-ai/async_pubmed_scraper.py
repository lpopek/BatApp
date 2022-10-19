import sys

import argparse
import time
from bs4 import BeautifulSoup
import pandas as pd
import random
import requests
import asyncio
import aiohttp
import socket
import warnings; warnings.filterwarnings('ignore')

# Use a variety of agents for our ClientSession to reduce traffic per agent
# This (attempts to) avoid a ban for high traffic from any single agent
# We should really use proxybroker or similar to ensure no ban
user_agents = [
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/22.0.1207.1 Safari/537.1",
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:55.0) Gecko/20100101 Firefox/55.0",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/22.0.1207.1 Safari/537.1",
        "Mozilla/5.0 (X11; CrOS i686 2268.111.0) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1092.0 Safari/536.6",
        "Mozilla/5.0 (Windows NT 6.0) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.36 Safari/536.5",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1063.0 Safari/536.3",
        "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1063.0 Safari/536.3",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_0) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1063.0 Safari/536.3",
        "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1062.0 Safari/536.3",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1062.0 Safari/536.3",
        "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.1 Safari/536.3",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.1 Safari/536.3",
        "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.1 Safari/536.3",
        "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1090.0 Safari/536.6",
        "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/19.77.34.5 Safari/537.1",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.9 Safari/536.5",
        "Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.0 Safari/536.3",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.24 (KHTML, like Gecko) Chrome/19.0.1055.1 Safari/535.24",
        "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/535.24 (KHTML, like Gecko) Chrome/19.0.1055.1 Safari/535.24"
        ]

def make_header():
    '''
    Chooses a random agent from user_agents with which to construct headers
    :return headers: dict: HTTP headers to use to get HTML from article URL
    '''
    # Make a header for the ClientSession to use with one of our agents chosen at random
    headers = {
            'User-Agent':random.choice(user_agents),
            }
    return headers

async def extract_by_article(url):
    '''
    Extracts all data from a single article
    :param url: string: URL to a single article (i.e. root pubmed URL + PMID)
    :return article_data: Dict: Contains all data from a single article
    '''
    conn = aiohttp.TCPConnector(family=socket.AF_INET)
    headers = make_header()
    # Reference our articles DataFrame containing accumulated data for ALL scraped articles
    global articles_data
    async with aiohttp.ClientSession(headers=headers, connector=conn) as session:
        async with semaphore, session.get(url) as response:
            data = await response.text()
            soup = BeautifulSoup(data, "lxml")
            # Get article abstract if exists - sometimes abstracts are not available (not an error)
            try:
                abstract_raw = soup.find('div', {'class': 'abstract-content selected'}).find_all('p')
                # Some articles are in a split background/objectives/method/results style, we need to join these paragraphs
                abstract = ' '.join([paragraph.text.strip() for paragraph in abstract_raw])
            except:
                abstract = 'NO_ABSTRACT'
            # Get author affiliations - sometimes affiliations are not available (not an error)
            try:
                doi = soup.find('a',{'class':'id-link'})['href']
            except:
                doi = 'NO_DOI'
            try:
                date = soup.find('time', {'class': 'citation-year'}).text
            except:
                date = 'NO_DATE'
            try:
                title = soup.find('meta',{'name':'citation_title'})['content'].strip('[]')
            except:
                title = 'NO_TITLE'

            # Format data as a dict to insert into a DataFrame
            article_data = {
                'url': url,
                'title': title, 
                'date': date, 
                'abstract': abstract,
                'doi': doi
            }
            # Add dict containing one article's data to list of article dicts
            articles_data.append(article_data)

async def get_pmids(page, keyword):
    """
    Extracts PMIDs of all articles from a pubmed search result, page by page,
    builds a url to each article, and stores all article URLs in urls: List[string]
    :param page: int: value of current page of a search result for keyword
    :param keyword: string: current search keyword
    :return: None
    """
    # URL to one unique page of results for a keyword search
    page_url = f'{pubmed_url}+{keyword}+&page={page}'
    headers = make_header()
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(page_url) as response:
            data = await response.text()
            # Parse the current page of search results from the response
            soup = BeautifulSoup(data, "lxml")
            # Find section which holds the PMIDs for all articles on a single page of search results
            pmids = soup.find('meta',{'name':'log_displayeduids'})['content']
            # alternative to get pmids: page_content = soup.find_all('div', {'class': 'docsum-content'}) + for line in page_content: line.find('a').get('href')
            # Extract URLs by getting PMIDs for all pubmed articles on the results page (default 10 articles/page)
            for pmid in pmids.split(','):
                url = root_pubmed_url + '/' + pmid
                urls.append(url)

def get_num_pages(keyword):
    '''
    Gets total number of pages returned by search results for keyword
    :param keyword: string: search word used to search for results
    :return: num_pages: int: number of pages returned by search results for keyword
    '''
    # Return user specified number of pages if option was supplied
    if args.pages != None: return args.pages

    # Get search result page and wait a second for it to load
    # URL to the first page of results for a keyword search
    headers=make_header()
    search_url = f'{pubmed_url}+{keyword}'
    with requests.get(search_url,headers=headers) as response:
        data = response.text
        soup = BeautifulSoup(data, "lxml")
        num_pages = int((soup.find('span', {'class': 'total-pages'}).get_text()).replace(',',''))
        return num_pages # Can hardcode this value (e.g. 10 pages) to limit # of articles scraped per keyword

async def build_article_urls(keywords):
    """
    PubMed uniquely identifies articles using a PMID
    e.g. https://pubmed.ncbi.nlm.nih.gov/32023415/ #shameless self plug :)
    Any and all articles can be identified with a single PMID

    Async wrapper for get_article_urls, page by page of results, for a single search keyword
    Creates an asyncio task for each page of search result for each keyword
    :param keyword: string: search word used to search for results
    :return: None
    """
    tasks = []
    for keyword in keywords:
        num_pages = get_num_pages(keyword)
        for page in range(1,num_pages+1):
            task = asyncio.create_task(get_pmids(page, keyword))
            tasks.append(task)

    await asyncio.gather(*tasks)

async def get_article_data(urls):
    """
    Async wrapper for extract_by_article to scrape data from each article (url)
    :param urls: List[string]: list of all pubmed urls returned by the search keyword
    :return: None
    """
    tasks = []
    for url in urls:
        if url not in scraped_urls:
            task = asyncio.create_task(extract_by_article(url))
            tasks.append(task)
            scraped_urls.append(url)

    await asyncio.gather(*tasks)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Asynchronous PubMed Scraper')
    parser.add_argument('--pages', type=int, default=None, help='Specify number of pages to scrape for EACH keyword. Each page of PubMed results contains 10 articles. \n Default = all pages returned for all keywords.')
    parser.add_argument('--start', type=int, default=2019, help='Specify start year for publication date range to scrape. Default = 2019')
    parser.add_argument('--stop', type=int, default=2020, help='Specify stop year for publication date range to scrape. Default = 2020')
    args = parser.parse_args()
    start = time.time()
    pubmed_url = f'https://pubmed.ncbi.nlm.nih.gov/?term={args.start}%3A{args.stop}%5Bdp%5D'
    root_pubmed_url = 'https://pubmed.ncbi.nlm.nih.gov'
    search_keywords = []
    try: 
        with open('./data/keywords.txt') as file:
            keywords = file.readlines()
            [search_keywords.append(keyword.strip()) for keyword in keywords]
        print(f'[INFO]: Finding PubMed article URLs for {len(keywords)} keywords found in keywords.txt')
    except FileNotFoundError as e:
        print('[ERROR]: File with keywords not found.')
        sys.exit(0)

    try:
        articles_data = []
        urls = []
        scraped_urls = []
        semaphore = asyncio.BoundedSemaphore(100)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(build_article_urls(search_keywords))
        print(f'[INFO]: Scraping initiated for {len(urls)} article URLs found from {args.start} to {args.stop}')
        loop = asyncio.get_event_loop()
        loop.run_until_complete(get_article_data(urls))
        articles_df = pd.DataFrame(articles_data, columns=['url','abstract','doi', 'title', 'date'])
        articles_df.to_csv('search_data.csv')
        print(f'[INFO]: It took {time.time() - start} seconds to find {len(urls)} articles; {len(scraped_urls)} unique articles were saved to search_data.csv')
        sys.exit(1)
    except Exception as e:
        print(f'[ERROR]: {e}')
        exit(0)
