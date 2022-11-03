"""
based on:
Sci-API Unofficial API
[Search|Download] research papers from [scholar.google.com|sci-hub.io].
@author zaytoun
"""

import re
import argparse
import hashlib
import logging
import os

import requests
import urllib3
from bs4 import BeautifulSoup
from retrying import retry

logging.basicConfig()
logger = logging.getLogger('Sci-Hub')
logger.setLevel(logging.DEBUG)

urllib3.disable_warnings()

SCHOLARS_BASE_URL = 'https://scholar.google.com/scholar'
HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:27.0) Gecko/20100101 Firefox/27.0'}

class SciHub(object):

    def __init__(self):
        self.sess = requests.Session()
        self.sess.headers = HEADERS
        self.available_base_url_list = self._get_available_scihub_urls()
        self.base_url = self.available_base_url_list[0] + '/'

    def _get_available_scihub_urls(self):
        urls = []
        res = requests.get('https://sci-hub.now.sh/')
        s = self._get_soup(res.content)
        for a in s.find_all('a', href=True):
            if 'sci-hub.' in a['href']:
                urls.append(a['href'])
        return urls

    def set_proxy(self, proxy):
        if proxy:
            self.sess.proxies = {
                "http": proxy,
                "https": proxy, }

    def _change_base_url(self):
        if not self.available_base_url_list:
            raise Exception('Ran out of valid sci-hub urls')
        del self.available_base_url_list[0]
        self.base_url = self.available_base_url_list[0] + '/'
        print("I'm changing to {}".format(self.available_base_url_list[0]))


    @retry(wait_random_min=100, wait_random_max=1000, stop_max_attempt_number=10)
    def download(self, identifier, destination='', path=None):
        data = self.fetch(identifier)

        if not 'err' in data:
            self._save(data['pdf'],
                       os.path.join(destination, path if path else data['name']))

        return data

    def fetch(self, identifier):
        try:
            url = self._get_direct_url(identifier)
            res = self.sess.get(url, verify=False)

            if res.headers['Content-Type'] != 'application/pdf':
                self._change_base_url()
                print(f'Failed to fetch pdf with identifier {identifier} '
                                           f'(resolved url {url}) due to captcha')
                raise CaptchaNeedException('Failed to fetch pdf with identifier %s '
                                           '(resolved url %s) due to captcha' % (identifier, url))
            else:
                return {
                    'pdf': res.content,
                    'url': url,
                    'name': self._generate_name(res)
                }

        except requests.exceptions.ConnectionError:
            print('Cannot access {}, changing url'.format(self.available_base_url_list[0]))
            self._change_base_url()

        except requests.exceptions.RequestException as e:
            return {
                'err': 'Failed to fetch pdf with identifier %s (resolved url %s) due to request exception.'
                       % (identifier, url)
            }

    def _get_direct_url(self, identifier):
        id_type = self._classify(identifier)

        return identifier if id_type == 'url-direct' \
            else self._search_direct_url(identifier)

    def _search_direct_url(self, identifier):
        res = self.sess.get(self.base_url + identifier, verify=False)
        s = self._get_soup(res.content)
        iframe = s.find('iframe')
        if iframe:
            return iframe.get('src') if not iframe.get('src').startswith('//') \
                else 'http:' + iframe.get('src')

    def _classify(self, identifier):
        if (identifier.startswith('http') or identifier.startswith('https')):
            if identifier.endswith('pdf'):
                return 'url-direct'
            else:
                return 'url-non-direct'
        elif identifier.isdigit():
            return 'pmid'
        else:
            return 'doi'

    def _save(self, data, path):
        with open(path, 'wb') as f:
            f.write(data)

    def _get_soup(self, html):
        return BeautifulSoup(html, 'html.parser')

    def _generate_name(self, res):
        name = res.url.split('/')[-1]
        name = re.sub('#view=(.+)', '', name)
        pdf_hash = hashlib.md5(res.content).hexdigest()
        return '%s-%s' % (pdf_hash, name[-20:])

class CaptchaNeedException(Exception):
    pass

def main():
    sh = SciHub()
    try:
        parser = argparse.ArgumentParser(description='SciHub Api')
        parser.add_argument('-o', '--output', metavar='path', help='directory to store papers', default='', type=str)
        args = parser.parse_args()
        with open('final_links.txt', 'r') as f:
            identifiers = f.read().splitlines()
            i = 0 
            for identifier in identifiers:
                print(f"[INFO]: Downloading article {identifier}.")
                if identifier != 'NO_DOI':
                    result = sh.download(identifier, args.output)
                    if 'err' in result:
                        print(f'[ERROR]: {result["err"]}' )
                    else:
                        print(f'[INFO]: Successfully downloaded file with identifier {identifier}')
                        i += 1
        os.remove('final_links.txt')
        exit(1)
    except Exception as err:
        print(f"[ERROR]: {err}")
        exit(0)
    


if __name__ == '__main__':
    main()