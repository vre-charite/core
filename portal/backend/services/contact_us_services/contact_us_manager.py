from models.service_meta_class import MetaService
from models.invitation import InvitationForm
from services.notifier_services.email_service import SrvEmail
from services.data_providers.bff_rds import SrvRDSSingleton
from services.container_services.container_manager import SrvContainerManager
from services.logger_services.logger_factory_service import SrvLoggerFactory
from .contact_us_email_template import contact_us_email_body_generator
from .confirm_email_template import confirm_email_body_generator
from resources.utils import helper_now_utc
from config import ConfigClass
from hashlib import md5
import json
from datetime import timedelta

class SrvContactUsManager(metaclass=MetaService):

    def __init__(self):
        self._logger = SrvLoggerFactory('api_contact_use').get_logger()

    def save_invitation(self, invitation: InvitationForm, access_token, current_identity):
        email_sender = SrvEmail()
        container_mgr = SrvContainerManager()

        html_generated = contact_us_email_body_generator(invitation.name,
            invitation.title,
            invitation.category,
            invitation.description,
            invitation.email)

        subject = "Contact Email from {}".format(invitation.email)
        email_sender.send(
            subject,
            html_generated,
            [ConfigClass.EMAIL_ADMIN_CONNECTION],
            msg_type='html')

        html_generated2 = confirm_email_body_generator(
            invitation.title,
            invitation.category,
            invitation.description,
            ConfigClass.EMAIL_ADMIN_CONNECTION)
        confirm_subject = "Confirmation of Contact Email"
        email_sender.send(
            confirm_subject,
            html_generated2,
            [invitation.email],
            msg_type='html')
        return 'Saved'

    def deactivate_invitation(self):
        pass