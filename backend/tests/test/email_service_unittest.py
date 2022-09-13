# Copyright 2022 Indoc Research
# 
# Licensed under the EUPL, Version 1.2 or – as soon they
# will be approved by the European Commission - subsequent
# versions of the EUPL (the "Licence");
# You may not use this work except in compliance with the
# Licence.
# You may obtain a copy of the Licence at:
# 
# https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
# 
# Unless required by applicable law or agreed to in
# writing, software distributed under the Licence is
# distributed on an "AS IS" basis,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.
# See the Licence for the specific language governing
# permissions and limitations under the Licence.
# 

import json
import unittest
import requests
import time
import uuid

class TestEmailSrv(unittest.TestCase):
    def test_01_send(self):
        url = "http://10.3.9.240:5065/v1/email"
        payload = {
            "sender": "notification@test",
            "receiver": "kang.huang.ut+111@gmail.com",
            "message": "You've been invited to a new PROJECT:  http://10.3.9.240:5065/v1/emai"
        }
        res = requests.post(
            url=url,
            json=payload
        )
        print(res.text)
        self.assertEqual(res.status_code, 200)

if __name__ == '__main__':
    unittest.main()
