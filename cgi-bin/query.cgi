#!/usr/bin/env python

# enable debugging
import cgitb
import cgi
import urllib2
from StringIO import StringIO
import gzip
import ConfigParser
import base64
import urllib
import logging
import sys
cgitb.enable()

print "Content-Type: application/json;charset=utf-8"
print

form = cgi.FieldStorage()
url = urllib2.unquote(form.getfirst('url', ''))

opener = urllib2.build_opener(urllib2.HTTPHandler)
req = urllib2.Request('http://tranquil-plateau-4519.herokuapp.com/%s' % url)

f = opener.open(req)
if f.info().get('Content-Encoding') == 'gzip':
    buf = StringIO(f.read())
    f = gzip.GzipFile(fileobj=buf)
print f.read()
