"""
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

# log config
logging.basicConfig()
logger = logging.getLogger('Sci-Hub')
logger.setLevel(logging.DEBUG)

#
urllib3.disable_warnings()

# constants
SCHOLARS_BASE_URL = 'https://scholar.google.com/scholar'
HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:27.0) Gecko/20100101 Firefox/27.0'}

class SciHub(object):
    """
    SciHub class can search for papers on Google Scholars 
    and fetch/download papers from sci-hub.io
    """

    def __init__(self):
        self.sess = requests.Session()
        self.sess.headers = HEADERS
        self.available_base_url_list = self._get_available_scihub_urls()
        self.base_url = self.available_base_url_list[0] + '/'

    def _get_available_scihub_urls(self):
        '''
        Finds available scihub urls via https://sci-hub.now.sh/
        '''
        urls = []
        res = requests.get('https://sci-hub.now.sh/')
        s = self._get_soup(res.content)
        for a in s.find_all('a', href=True):
            if 'sci-hub.' in a['href']:
                urls.append(a['href'])
        return urls

    def set_proxy(self, proxy):
        '''
        set proxy for session
        :param proxy_dict:
        :return:
        '''
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
        """
        Downloads a paper from sci-hub given an indentifier (DOI, PMID, URL).
        Currently, this can potentially be blocked by a captcha if a certain
        limit has been reached.
        """
        data = self.fetch(identifier)

        if not 'err' in data:
            self._save(data['pdf'],
                       os.path.join(destination, path if path else data['name']))

        return data

    def fetch(self, identifier):
        """
        Fetches the paper by first retrieving the direct link to the pdf.
        If the indentifier is a DOI, PMID, or URL pay-wall, then use Sci-Hub
        to access and download paper. Otherwise, just download paper directly.
        """

        try:
            url = self._get_direct_url(identifier)

            # verify=False is dangerous but sci-hub.io 
            # requires intermediate certificates to verify
            # and requests doesn't know how to download them.
            # as a hacky fix, you can add them to your store
            # and verifying would work. will fix this later.
            res = self.sess.get(url, verify=False)

            if res.headers['Content-Type'] != 'application/pdf':
                self._change_base_url()
                print(f'Failed to fetch pdf with identifier {identifier} '
                                           f'(resolved url {url}) due to captcha')
                raise CaptchaNeedException('Failed to fetch pdf with identifier %s '
                                           '(resolved url %s) due to captcha' % (identifier, url))
                # return {
                #     'err': 'Failed to fetch pdf with identifier %s (resolved url %s) due to captcha'
                #            % (identifier, url)
                # }
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
            # print(f'[ERROR]: Failed to fetch pdf with identifier {identifier} (resolved url {url}) due to request exception.')
            return {
                'err': 'Failed to fetch pdf with identifier %s (resolved url %s) due to request exception.'
                       % (identifier, url)
            }

    def _get_direct_url(self, identifier):
        """
        Finds the direct source url for a given identifier.
        """
        id_type = self._classify(identifier)

        return identifier if id_type == 'url-direct' \
            else self._search_direct_url(identifier)

    def _search_direct_url(self, identifier):
        """
        Sci-Hub embeds papers in an iframe. This function finds the actual
        source url which looks something like https://moscow.sci-hub.io/.../....pdf.
        """
        res = self.sess.get(self.base_url + identifier, verify=False)
        s = self._get_soup(res.content)
        iframe = s.find('iframe')
        if iframe:
            return iframe.get('src') if not iframe.get('src').startswith('//') \
                else 'http:' + iframe.get('src')

    def _classify(self, identifier):
        """
        Classify the type of identifier:
        url-direct - openly accessible paper
        url-non-direct - pay-walled paper
        pmid - PubMed ID
        doi - digital object identifier
        """
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
        """
        Save a file give data and a path.
        """
        with open(path, 'wb') as f:
            f.write(data)

    def _get_soup(self, html):
        """
        Return html soup.
        """
        return BeautifulSoup(html, 'html.parser')

    def _generate_name(self, res):
        """
        Generate unique filename for paper. Returns a name by calcuating 
        md5 hash of file contents, then appending the last 20 characters
        of the url which typically provides a good paper identifier.
        """
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