from enum import Enum
import datetime

class DataManifest:
    def __init__(self):
        timestamp = round(datetime.datetime.utcnow().timestamp())
        self.__attribute_map = {
            "manifest_id": None,
            "key": "",
            "diplay_name": "",
            "value": "",
            "note": "",
            "type": "",
            "create_timestamp": timestamp,
            "update_timestamp": timestamp,
            "optional": True,
        }

    @property
    def to_dict(self):
        '''
        property not function
        '''
        return self.__attribute_map

    @property
    def manifest_id(self):
        return self.__attribute_map['manifest_id']
    @manifest_id.setter
    def manifest_id(self, my_id: str):
        self.__attribute_map['manifest_id'] = my_id

    @property
    def key(self):
        return self.__attribute_map['key']
    @key.setter
    def key(self, key: str):
        self.__attribute_map['key'] = key

    @property
    def diplay_name(self):
        return self.__attribute_map['diplay_name']
    @diplay_name.setter
    def diplay_name(self, diplay_name: str):
        self.__attribute_map['diplay_name'] = diplay_name

    @property
    def value(self):
        return self.__attribute_map['value']
    @value.setter
    def value(self, value: str):
        self.__attribute_map['value'] = value

    @property
    def note(self):
        return self.__attribute_map['note']
    @note.setter
    def note(self, note: str):
        self.__attribute_map['note'] = note

    @property
    def type(self):
        return self.__attribute_map['type']
    @type.setter
    def type(self, type: str):
        self.__attribute_map['type'] = type

    @property
    def create_timestamp(self):
        return self.__attribute_map['create_timestamp']
    @create_timestamp.setter
    def create_timestamp(self, create_timestamp: int):
        self.__attribute_map['create_timestamp'] = create_timestamp

    @property
    def update_timestamp(self):
        return self.__attribute_map['update_timestamp']
    @update_timestamp.setter
    def update_timestamp(self, update_timestamp: int):
        self.__attribute_map['update_timestamp'] = update_timestamp

    @property
    def optional(self):
        return self.__attribute_map['optional']
    @optional.setter
    def optional(self, optional: bool):
        self.__attribute_map['optional'] = optional

class EDataManifestType(Enum):
    ONE_CHOICE = 0,
    MULTIPLE_CHOICE = 1,
    INPUT_STRING = 2,
    SUB_MANIFEST = 3