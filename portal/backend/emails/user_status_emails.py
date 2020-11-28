def user_disable_email_generator(username, admin_name, admin_email):
    return(
        '''<!DOCTYPE html> \
            <body>\
                <h4>Dear {},</h4>\
                <p>{} has disabled your account on VRE</p>\
                <p>If you believe this modification was made in error please contact the Platform Administrator: <a href="mailto: {}">{}</a></p>\
                <br><br><br>\
                <p>This is an automated message, should you require assistance please contact: {}</p><br>\
            </body>\
        </html>'''.format(username, admin_name, admin_email, admin_email, admin_email)
    )

def user_enable_email_generator(username, admin_name, admin_email):
    return(
        '''<!DOCTYPE html> \
            <body>\
                <h4>Dear {},</h4>\
                <p>{} has enabled your account on VRE</p>\
                <p>If you believe this modification was made in error please contact the Platform Administrator: <a href="mailto: {}">{}</a></p>\
                <br><br><br>\
                <p>This is an automated message, should you require assistance please contact: {}</p><br>\
            </body>\
        </html>'''.format(username, admin_name, admin_email, admin_email, admin_email)
    )

def user_project_enable_email_generator(username, admin_name, project_name, admin_email):
    return(
        '''<!DOCTYPE html> \
            <body>\
                <h4>Dear {},</h4>\
                <p>{} has restored your access to {} on VRE</p>\
                <p>If you believe this modification was made in error please contact the Platform Administrator: <a href="mailto: {}">{}</a></p>\
                <br><br><br>\
                <p>This is an automated message, should you require assistance please contact: {}</p><br>\
            </body>\
        </html>'''.format(username, admin_name, project_name, admin_email, admin_email, admin_email)
    )
