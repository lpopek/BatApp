import json
import os, sys
import pandas as pd

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import RegexpTokenizer
from nltk.stem import WordNetLemmatizer

import re
import joblib

nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger') 
nltk.download('omw-1.4')
sw_list = stopwords.words('english')
tokenizer = RegexpTokenizer(r'\w+')
lemmatizer = WordNetLemmatizer()

def remove_tags(raw_text):
    cleaned_text = re.sub(re.compile('<.*?>'), '', raw_text)
    return cleaned_text

def preprocess():
    global df
    df = df[df.abstract != 'NO_ABSTRACT'].reset_index(drop=True)
    df.drop_duplicates(inplace=True)
    df['abstract'] = df['abstract'].apply(remove_tags)
    df['abstract'] = df['abstract'].apply(lambda x:x.replace("\\", ""))
    df['abstract'] = df['abstract'].apply(lambda x:x.replace("                    ", " ")) 
    df['abstract'] = df['abstract'].apply(lambda x:x.lower())

def unify_words():
    df['abstract'] = df['abstract'].apply(lambda x: [item for item in x.split() if item not in sw_list]).apply(lambda x:" ".join(x))
    df['abstract'] = df['abstract'].apply(lambda x: [lemmatizer.lemmatize(word) for word in x.split()]).apply(lambda x:" ".join(x))
    df['abstract'] = df['abstract'].apply(lambda x: tokenizer.tokenize(x))
if __name__ == "__main__":
    try:
        print("[INFO]: Uploading data.")
        df = pd.read_csv('search_data.csv')
        print('[INFO]: Preprocessing abstract texts.')
        preprocess()
        print('[INFO]: Tokenisation, lemantinsation.')
        unify_words()
        print('[INFO]: Conducting classification.')
        urls = df['doi']
        abstracts = df['abstract']
        vectorizer = joblib.load('cls/vectoriser.pkl')
        abstract_vec = vectorizer.transform(" ".join(word_list) for word_list in abstracts)
        classificator = joblib.load('cls/svm.joblib')
        predicted_cls = classificator.predict(abstract_vec)
        print('[INFO]: Exporting results to file. Classification postprocessing.')
        positive_results = [{'url': doi, 'title': title, 'publish_date': date} for cls, doi, title, date in zip(predicted_cls, urls, df['title'], df['date']) if cls]
        positive_links = [paper['url'] for paper in positive_results]
        with open('final_links.txt', 'w') as f:
            f.write('\n'.join(positive_links))
        with open("possible_discoveries.json", 'w') as jf:
            json.dump(positive_results, jf, indent=4)
        os.remove('search_data.csv')
        sys.exit(1)
    except Exception as e:
        print(f'[ERROR]: {e}')
        sys.exit(0)
    
        

