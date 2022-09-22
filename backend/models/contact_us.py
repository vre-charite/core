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

class ContactUsForm:
    def __init__(self, event=None):
        if event:
            self._attribute_map = event
        else:
            self._attribute_map = {
                'email': '',  # by default success
                'category': '',  # empty when success
                'description': '',
                'name': '',
                'title': '',
                'attachments': [],
            }

    @property
    def to_dict(self):
        return self._attribute_map

    @property
    def email(self):
        return self._attribute_map['email']

    @email.setter
    def email(self, email):
        self._attribute_map['email'] = email

    @property
    def category(self):
        return self._attribute_map['category']

    @category.setter
    def category(self, category):
        self._attribute_map['category'] = category

    @property
    def description(self):
        return self._attribute_map['description']

    @description.setter
    def description(self, description):
        self._attribute_map['description'] = description


    @property
    def name(self):
        return self._attribute_map['name']

    @name.setter
    def name(self, name):
        self._attribute_map['name'] = name


    @property
    def title(self):
        return self._attribute_map['title']

    @title.setter
    def title(self, title):
        self._attribute_map['title'] = title

    @property
    def attachments(self):
        return self._attribute_map.get('attachments', [])

    @attachments.setter
    def attachments(self, attachments):
        self._attribute_map['attachments'] = attachments
