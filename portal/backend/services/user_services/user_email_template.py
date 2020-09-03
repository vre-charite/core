def update_role_email_body_generator(username, admin_name, project_name, new_role, login_url, admin_email):
    return(
        '''<!DOCTYPE html> \
            <body>\
                <h4>Dear {},</h4>\
                <p>{} has modified your access in the following project:</p><br>\
                <p>Project Name: {}</p>\
                <p>New Role: {}</p><br>\
                <p>In order to access the project please visit the link below and login using your credentials: </p>\
                <a href="{}">{}</a><br>\
                <p>If you are having difficulty accessing the link please copy and paste the following into your browser:</p>\
                <p>{}</p><br>\
                <p>If you believe this modification was made in error please contact your project admin <a href="mailto: {}">{}</a></p>
                <br><br><br><br>\
                <p>This is an automated message please do not reply.<br>Should you require assistance please contact: <a href="mailto: {}">{}</a></p><br>\
            </body>\
        </html>'''.format(username, admin_name, project_name, new_role, login_url, login_url, login_url, admin_email, admin_email, admin_email, admin_email)
    )


def invite_user_email_body_generator(username, admin_name, project_name, role, login_url, admin_email):
    return(
        '''<!DOCTYPE html> \
            <body>\
                <h4>Dear {},</h4>\
                <p>{} has invited you to the following project:</p><br>\
                <p>Project Name: {}</p>\
                <p>Role: {}</p><br>\
                <p>In order to access the project please visit the link below and login using your credentials: </p>\
                <a href="{}">{}</a><br>\
                <p>If you are having difficulty accessing the link please copy and paste the following into your browser:</p>\
                <p>{}</p><br>\
                <p>If you believe this modification was made in error please contact your project admin <a href="mailto: {}">{}</a></p>
                <br><br><br><br>\
                <p>This is an automated message please do not reply.<br>Should you require assistance please contact: <a href="mailto: {}">{}</a></p><br>\
            </body>\
        </html>'''.format(username, admin_name, project_name, role, login_url, login_url, login_url, admin_email, admin_email, admin_email, admin_email)
    )
