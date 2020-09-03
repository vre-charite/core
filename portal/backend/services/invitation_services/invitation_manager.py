from models.service_meta_class import MetaService
from models.invitation import InvitationForm
from services.notifier_services.email_service import SrvEmail
from services.data_providers.bff_rds import SrvRDSSingleton
from services.container_services.container_manager import SrvContainerManager
from services.logger_services.logger_factory_service import SrvLoggerFactory
from .invitation_email_template import invitation_email_body_generator
from resources.utils import helper_now_utc
from config import ConfigClass
from hashlib import md5
import json
from datetime import timedelta

class SrvInvitationManager(metaclass=MetaService):

    def __init__(self):
        self.rds_singleton = SrvRDSSingleton()
        self.rds_schema = ConfigClass.RDS_SCHEMA_DEFAULT
        self.table_full_name = "{}.user_invitation".format(self.rds_schema)
        self._logger = SrvLoggerFactory('api_invitation').get_logger()

    def validate_invitation_code(self, invitation_code):
        '''
        (str) -> (bool, InvitationForm | None)    #**TypeContract**
        '''
        self._logger.info('start validating invitation code...........')
        invitation_detail = self.read_invitation(invitation_code)
        if not invitation_detail:
            return (False, None)
        expiry_dt = invitation_detail[2]
        now_dt = helper_now_utc().replace(tzinfo=None)
        diff_dt_days = (expiry_dt - now_dt).days
        is_valid = True if invitation_detail and diff_dt_days > 0 else False
        self._logger.info('[Info] valid invitation' if is_valid else '[Error] invalid invitation')
        return (is_valid, invitation_detail)

    def read_invitation(self, invitation_code):
        '''
        (str) -> () | None   #**TypeContract**
        '''
        read_query = "Select * from {} where invitation_code='{}' ORDER BY create_timestamp asc".format(
            self.table_full_name,
            invitation_code)
        invitation_feteched = self.rds_singleton.simple_query(read_query)
        return invitation_feteched[len(invitation_feteched) - 1] if invitation_feteched != [] else None

    def save_invitation(self, invitation: InvitationForm, access_token, current_identity):
        invitor_name = current_identity['first_name'] + ' ' + current_identity['last_name']
        email_sender = SrvEmail()
        container_mgr = SrvContainerManager()
        raw_data_str = invitation.email + str(invitation.project_id)
        invitation_code_generated = md5(raw_data_str.encode('utf-8')).hexdigest()
        invitataion_link = ConfigClass.INVITATION_URL_PREFIX + '/' + invitation_code_generated
        form_data = invitation.to_dict
        form_data_json = json.dumps(form_data)
        now_utc_dt = helper_now_utc()
        expiry_dt = now_utc_dt + timedelta(days=ConfigClass.INVITATION_EXPIRY_DAYS)
        create_timestamp = "Timestamp'{}'".format(now_utc_dt.isoformat())
        expiry_timestamp = "Timestamp'{}'".format(expiry_dt.isoformat())
        save_query = "INSERT INTO {}(invitation_code, invitation_detail, expiry_timestamp, create_timestamp) \
                values ('{}', '{}', {}, {}) RETURNING *".format(
            self.table_full_name,
            invitation_code_generated,
            form_data_json,
            expiry_timestamp,
            create_timestamp)
        inserted = self.rds_singleton.simple_query(save_query)
        self._logger.info(str(len(inserted)) + ' Invitations Saved To Database')
        my_project = container_mgr.check_container_exist(
                access_token, "Dataset", invitation.project_id)[0]
        my_project_name = my_project['name']
        self._logger.info(my_project)
        subject = "Welcome to Project {}!".format(my_project_name)
        html_generated = invitation_email_body_generator(invitor_name,
            my_project_name,
            invitation.role,
            invitataion_link,
            ConfigClass.EMAIL_ADMIN_CONNECTION)
        email_sender.send(
            subject,
            html_generated,
            [invitation.email],
            msg_type='html')
        return 'Saved'

    def deactivate_invitation(self):
        pass