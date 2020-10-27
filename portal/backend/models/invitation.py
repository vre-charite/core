class InvitationForm:
    def __init__(self, event=None):
        if event:
            self._attribute_map = event
        else:
            self._attribute_map = {
                'email': '',  # by default success
                'projectId': -1,  # empty when success
                'role': '',
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
    def project_id(self):
        return self._attribute_map['projectId']

    @project_id.setter
    def project_id(self, project_id):
        self._attribute_map['projectId'] = project_id

    @property
    def role(self):
        return self._attribute_map['role']

    @role.setter
    def role(self, role):
        self._attribute_map['role'] = role
