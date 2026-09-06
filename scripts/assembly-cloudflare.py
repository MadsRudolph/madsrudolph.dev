#!/usr/bin/env python3
"""Provision only the ADC assembly Pages project and its dedicated hostname.

Credentials remain in the existing portfolio GitHub Actions secrets. Never
print headers, environment values, or tokens. Existing unrelated DNS is untouched.
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

PROJECT = 'vinyl-adc-assembly'
HOST = 'vinyl-adc.madsrudolph.dev'
BASE = 'https://api.cloudflare.com/client/v4'

class APIError(RuntimeError):
    def __init__(self, status, messages):
        self.status = status
        super().__init__(f'Cloudflare HTTP {status}: {messages}')

def api(path, method='GET', data=None):
    request = urllib.request.Request(BASE + path, method=method,
        data=json.dumps(data).encode() if data is not None else None,
        headers={'Authorization': 'Bearer ' + os.environ['CLOUDFLARE_API_TOKEN'],
                 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        try:
            body = json.load(error)
            messages = '; '.join(str(x.get('message', 'API error')) for x in body.get('errors', []))
        except Exception:
            messages = 'Request rejected'
        raise APIError(error.code, messages) from None
    if not result.get('success'):
        raise APIError(200, '; '.join(str(x.get('message', 'API error')) for x in result.get('errors', [])))
    return result['result']

def summary(message):
    print(message)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as stream:
            stream.write(message + '\n\n')

def main():
    prefix = '/accounts/' + os.environ['CLOUDFLARE_ACCOUNT_ID'] + '/pages/projects'
    project_path = prefix + '/' + PROJECT
    if sys.argv[1] == 'prepare':
        try:
            project = api(project_path)
        except APIError as error:
            if error.status != 404:
                raise
            project = api(prefix, 'POST', {'name': PROJECT, 'production_branch': 'main'})
        summary('Assembly Pages project ready: https://' + project['subdomain'])
        return

    project = api(project_path)
    target = project['subdomain']
    domains = api(project_path + '/domains')
    domain = next((d for d in domains if d.get('name') == HOST), None)
    if domain is None:
        domain = api(project_path + '/domains', 'POST', {'name': HOST})
    summary(f'Custom hostname registered: {HOST}; status: {domain.get("status", "pending")}.')
    if domain.get('status') == 'active':
        return
    try:
        zones = api('/zones?' + urllib.parse.urlencode({'name':'madsrudolph.dev'}))
        if len(zones) != 1:
            raise RuntimeError('The deployment credential cannot identify the madsrudolph.dev DNS zone.')
        dns_path = '/zones/' + zones[0]['id'] + '/dns_records'
        records = api(dns_path + '?' + urllib.parse.urlencode({'name': HOST}))
        if records:
            if not any(r['type'] == 'CNAME' and r['content'].rstrip('.') == target.rstrip('.') for r in records):
                raise RuntimeError('An existing DNS record uses this hostname. It was left unchanged.')
            summary('The expected assembly CNAME is already present.')
        else:
            api(dns_path, 'POST', {'type':'CNAME', 'name':HOST, 'content':target, 'ttl':1, 'proxied':True})
            summary('Created the assembly CNAME. Cloudflare certificate activation may take a few minutes.')
    except (APIError, RuntimeError) as error:
        summary(f'DNS setup needs attention: {error}\nRequired CNAME: {HOST} → {target}.\nThe deployed fallback is https://{target}.')
        raise SystemExit(1)

if __name__ == '__main__':
    main()
