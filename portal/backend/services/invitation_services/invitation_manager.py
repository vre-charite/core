from models.service_meta_class import MetaService
from models.invitation import InvitationForm
from models.user_type import map_neo4j_to_frontend
from services.notifier_services.email_service import SrvEmail
from services.data_providers.bff_rds import SrvRDSSingleton
from services.container_services.container_manager import SrvContainerManager
from services.logger_services.logger_factory_service import SrvLoggerFactory
from .invitation_email_template import invitation_email_body_generator, invitation_email_body_generator_without_project
from resources.utils import helper_now_utc
from config import ConfigClass
from hashlib import md5
import json
from datetime import timedelta, datetime

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
            self._logger.info('[Error] invalid invitation')
            return (False, None, 404)
        expiry_dt = invitation_detail[2]
        now_dt = helper_now_utc().replace(tzinfo=None)
        diff_dt_days = (expiry_dt - now_dt).days
        if not diff_dt_days > 0:
            self._logger.info('[Error] expired invitation')
            return (False, invitation_detail, 401)
        self._logger.info('[Info] valid invitation')
        return (True, invitation_detail, 200)

    def read_invitation(self, invitation_code):
        '''
        (str) -> () | None   #**TypeContract**
        '''
        read_query = f"Select * from {self.table_full_name} where invitation_code=%(invitation_code)s ORDER BY create_timestamp asc"
        invitation_feteched = self.rds_singleton.simple_query(read_query, sql_params={ "invitation_code": invitation_code })
        return invitation_feteched[len(invitation_feteched) - 1] if invitation_feteched != [] else None

    def save_invitation(self, invitation: InvitationForm, access_token, current_identity):
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
        update_query = f"UPDATE {self.table_full_name} SET expiry_timestamp = %(expiry_timestamp)s \
                WHERE invitation_detail = %(invitation_detail)s RETURNING *"
        sql_params = {
            "expiry_timestamp": now_utc_dt.isoformat(),
            "invitation_detail": form_data_json,
        }
        self.rds_singleton.simple_query(update_query, sql_params)

        save_query = f"INSERT INTO {self.table_full_name}(invitation_code, invitation_detail, expiry_timestamp, create_timestamp, invited_by) \
                values (%(invitation_code_generated)s, %(form_data_json)s, %(expiry_timestamp)s, %(create_timestamp)s, %(invited_by)s) RETURNING *"
        sql_params = {
            "invitation_code_generated": invitation_code_generated,
            "form_data_json": form_data_json,
            "expiry_timestamp": expiry_timestamp,
            "create_timestamp": create_timestamp,
            "invited_by": invitor_name
        }
        inserted = self.rds_singleton.simple_query(save_query, sql_params)
        self._logger.info(str(len(inserted)) + ' Invitations Saved To Database')
        if invitation.project_id:
            my_project = container_mgr.check_container_exist(
                    access_token, "Dataset", invitation.project_id)[0]
            my_project_name = my_project['name']
            self._logger.info(my_project)
            subject = "Welcome to Project {}!".format(my_project_name)
            html_generated = invitation_email_body_generator(invitor_name,
                my_project_name,
                map_neo4j_to_frontend(invitation.role),
                invitataion_link,
                ConfigClass.EMAIL_ADMIN_CONNECTION)
        else:
            subject = "Welcome to VRE!"
            html_generated = invitation_email_body_generator_without_project(
                invitor_name,
                invitataion_link,
                ConfigClass.EMAIL_ADMIN_CONNECTION
            )
        email_sender.send(
            subject,
            html_generated,
            [invitation.email],
            msg_type='html')
        return 'Saved'

    def deactivate_invitation(self, invitation_code):
        query = f"UPDATE {self.table_full_name} set expiry_timestamp=%(expiry)s where invitation_code=%(invitation_code)s"
        sql_params = {
            "expiry": datetime.now(),
            "invitation_code": invitation_code,
        }
        self.rds_singleton.simple_query(query, sql_params, iffetch=False)
        self._logger.info(str(invitation_code) + ' Invitation deactivated')


    def get_invitations(self, page, page_size, filters, order_by, order_type):
        try:
            # get all pending users
            sorter = "expiry_timestamp"
            order = "desc"

            sql_params = {
                "limit": page_size,
                "offset": page * page_size,
            }

            read_query = f"Select * from {self.table_full_name}"
            count_query = f"Select COUNT(*) from {self.table_full_name}"

            if filters and 'email' in filters:
                email_filter = '{{"email": "%{}%, "role"%'.format(filters['email'])

                read_query = f"Select * from {self.table_full_name} where invitation_detail ILIKE %(email)s ESCAPE ''"

                count_query = f"Select COUNT(*) from {self.table_full_name} where invitation_detail ILIKE %(email)s ESCAPE ''"

                sql_params['email'] = email_filter

            if filters and 'project_id' in filters:
                project_filter = '%"projectId": {}}}'.format(str(filters['project_id']))
                project_query = f" and invitation_detail ILIKE %(projectId)s"

                read_query += project_query
                count_query += project_query

                sql_params['projectId'] = project_filter

                if 'email' not in filters:
                    read_query = f"Select * from {self.table_full_name} where invitation_detail ILIKE %(projectId)s ESCAPE ''"
                    count_query = f"Select COUNT(*) from {self.table_full_name} where invitation_detail ILIKE %(projectId)s ESCAPE ''"


            if filters and 'invited_by' in filters:
                invite_filters = '%{}%'.format(filters['invited_by'])
                sql_params['invited_by'] = invite_filters

                if not 'project_id' in filters and not 'email' in filters:
                    read_query += f" where invited_by ILIKE %(invited_by)s"
                    count_query += f" where invited_by ILIKE %(invited_by)s"
                else:
                    read_query += f" and invited_by ILIKE %(invited_by)s"
                    count_query += f" and invited_by ILIKE %(invited_by)s"


            if filters and 'status' in filters:
                status_filter = "{} and expiry_timestamp>'{}'".format(" ", datetime.now())
                if filters['status'] == 'disabled':
                    status_filter = "{} and expiry_timestamp<'{}'".format(" ", datetime.now())

                read_query += status_filter
                count_query += status_filter
            

            if order_by:
                sorter = order_by
            read_query += "{} ORDER BY {}".format(" ", sorter)

            if order_type:
                order = order_type
            read_query += "{}{}".format(" ", order)

            read_query = read_query + " " + "LIMIT %(limit)s OFFSET %(offset)s"

            records = self.rds_singleton.simple_query(read_query, sql_params)
            count = self.rds_singleton.simple_query(count_query, sql_params) # list of tuple [(34,)]
            count = count[0][0]

            return records, count
        
        except Exception as e:
            self._logger.error('Fetch all pending users' + str(e))

