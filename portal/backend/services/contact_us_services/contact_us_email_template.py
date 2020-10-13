def contact_us_email_body_generator(name, title, category, description, email):
    return(
        '''<!DOCTYPE html> \
            <body>\
                <h4>Dear VRE Admin,</h4>\
                <p>{} has sent you an email for asking help:</p>\
                <p>Issue title: {}</p>\
                <p>Issue category: {}</p>\
                <p>Issue description:</p>\
                <p>{}</p><br><br><br>\
                <p><br>User contact: {}</p><br>\
            </body>\
        </html>'''.format(name, title, category, description, email)
    )