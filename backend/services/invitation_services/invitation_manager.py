from models.service_meta_class import MetaService
from models.invitation import InvitationForm, InvitationModel, db
from models.user_type import map_neo4j_to_frontend
from services.notifier_services.email_service import SrvEmail
from services.data_providers.bff_rds import SrvRDSSingleton
from services.container_services.container_manager import SrvContainerManager
from services.logger_services.logger_factory_service import SrvLoggerFactory
from resources.utils import helper_now_utc
from config import ConfigClass
from hashlib import md5
import json
from datetime import timedelta, datetime

class SrvInvitationManager(metaclass=MetaService):

    def __init__(self):
        self._logger = SrvLoggerFactory('api_invitation').get_logger()

    def validate_invitation_code(self, invitation_code):
        '''
        (str) -> (bool, InvitationForm | None)    #**TypeContract**
        '''
        self._logger.info('start validating invitation code...........')
        invite = self.read_invitation(invitation_code)
        if not invite:
            self._logger.info('[Error] invalid invitation')
            return (False, None, 404)
        expiry_dt = invite.expiry_timestamp
        now_dt = helper_now_utc().replace(tzinfo=None)
        diff_dt_days = (expiry_dt - now_dt).days
        if not diff_dt_days > 0:
            self._logger.info('[Error] expired invitation')
            return (False, invite, 401)
        self._logger.info('[Info] valid invitation')
        return (True, invite, 200)

    def read_invitation(self, invitation_code):
        invite = db.session.query(InvitationModel).filter_by(invitation_code=invitation_code).first()
        return invite

    def save_invitation(self, invitation: InvitationModel, access_token, current_identity):
        invitor_name = current_identity['username']
        email_sender = SrvEmail()
        container_mgr = SrvContainerManager()
        now_utc_dt = helper_now_utc()
        expiry_dt = now_utc_dt + timedelta(days=ConfigClass.INVITATION_EXPIRY_DAYS)
        create_timestamp = now_utc_dt.isoformat()
        expiry_timestamp = expiry_dt.isoformat()

        raw_data_str = invitation.email + str(invitation.project_id) + str(create_timestamp)
        invitation_code_generated = md5(raw_data_str.encode('utf-8')).hexdigest()
        invitataion_link = ConfigClass.INVITATION_URL_PREFIX + '/' + invitation_code_generated
        form_data = invitation.to_dict
        form_data_json = json.dumps(form_data)

        # If there is another invitation with the same details expiry it
        sql_params = {
            "invitation_detail": form_data_json,
            "email": invitation.email,
            "role": invitation.role,
            "project": str(invitation.project_id),
        }
        invite = db.session.query(InvitationModel).filter_by(**sql_params).first()
        if invite:
            invite.expiry_timestamp = now_utc_dt.isoformat()
            db.session.commit()

        sql_params = {
            "invitation_code": invitation_code_generated,
            "invitation_detail": form_data_json,
            "expiry_timestamp": expiry_timestamp,
            "create_timestamp": create_timestamp,
            "invited_by": invitor_name,
            "email": invitation.email,
            "role": invitation.role,
            "project": str(invitation.project_id)
        }
        inserted = InvitationModel(**sql_params)
        db.session.add(inserted)
        db.session.commit()
        db.session.refresh(inserted)

        self._logger.info(f'Invitation {inserted.id} Saved To Database')
        if invitation.project_id:
            my_project = container_mgr.check_container_exist(
                    access_token, "Dataset", invitation.project_id)[0]
            my_project_name = my_project['name']
            self._logger.info(my_project)
            subject = "Welcome to Project {}!".format(my_project_name)
            template = "invitation/project.html"
            template_kwargs = {
                "invitor": invitor_name,
                "project_name": my_project_name,
                "role": map_neo4j_to_frontend(invitation.role),
                "register_link": invitataion_link,
                "admin_email": ConfigClass.EMAIL_ADMIN_CONNECTION,
            }
        else:
            subject = "Welcome to VRE!"
            template = "invitation/without_project.html"
            template_kwargs = {
                "invitor": invitor_name,
                "register_link": invitataion_link,
                "admin_email": ConfigClass.EMAIL_ADMIN_CONNECTION,
            }
        email_sender.send(
            subject,
            [invitation.email],
            msg_type='html',
            template=template,
            template_kwargs=template_kwargs,
        )
        return 'Saved'

    def deactivate_invitation(self, invitation_code):
        sql_params = {
            "invitation_code": invitation_code,
        }
        invite = db.session.query(InvitationModel).filter_by(**sql_params).first()
        if invite:
            invite.expiry_timestamp = datetime.now()
            db.session.commit()
        self._logger.info(str(invitation_code) + ' Invitation deactivated')


    def get_invitations(self, page, page_size, filters, order_by, order_type):
        if not filters:
            filters = {}

        sql_filter = {}
        if "project_id" in filters:
            sql_filter["project"] = str(filters["project_id"])

        invites = db.session.query(InvitationModel).filter_by(**sql_filter)
        if "email" in filters:
            invites = invites.filter(InvitationModel.invitation_detail.like("%" + filters["email"] + "%"))
        if "invited_by" in filters:
            invites = invites.filter(InvitationModel.invited_by.like("%" + filters["invited_by"] + "%"))
        if "status" in filters:
            if filters["status"] == "disabled":
                invites = invites.filter(InvitationModel.expiry_timestamp <= datetime.now())
            else:
                invites = invites.filter(InvitationModel.expiry_timestamp >= datetime.now())

        if not order_by:
            order_by = "expiry_timestamp"
        if order_type == "desc":
            sort_param = getattr(InvitationModel, order_by).desc()
        else:
            sort_param = getattr(InvitationModel, order_by).asc()
        invites = invites.order_by(sort_param)
        count = len(invites.all())
        invites = invites.offset(page * page_size).limit(page_size).all()
        return invites, count
