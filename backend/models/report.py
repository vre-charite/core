from config import ConfigClass
from datetime import datetime


class ReportForm:
    def __init__(self, event=None):
        if event:
            self._attribute_map = event
        else:
            _attribute_map = {
                'uploader': '',  # by default success
                'files': [],  # empty when success
                # 'timestamp': ''  # form created times
            }

    @property
    def to_dict(self):
        return self._attribute_map

    @property
    def uploader(self):
        return self._attribute_map['uploader']

    @uploader.setter
    def email(self, uploader):
        self._attribute_map['uploader'] = uploader

    @property
    def files(self):
        return self._attribute_map['files']

    @files.setter
    def files(self, files):
        self._attribute_map['files'] = files

    def email_attribute_mapatter(self):
        now = datetime.now()
        timestamp = now.strftime("%d/%m/%Y %H:%M:%S")

        html_header = '''
        <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <style type="text/css">
                table {
                    background: white;
                    border-radius:3px;
                    border-collapse: collapse;
                    height: auto;
                    max-width: 900px;
                    padding:5px;
                    width: 100%;
                    animation: float 5s infinite;
                }
                th {
                    color:#D5DDE5;;
                    background:#1b1e24;
                    border-bottom: 4px solid #9ea7af;
                    font-size:14px;
                    font-weight: 300;
                    padding:10px;
                    text-align:center;
                    vertical-align:middle;
                }
                tr {
                    border-top: 1px solid #C1C3D1;
                    border-bottom: 1px solid #C1C3D1;
                    border-left: 1px solid #C1C3D1;
                    color:#666B85;
                    font-size:16px;
                    font-weight:normal;
                }
                tr:hover td {
                    background:#4E5066;
                    color:#FFFFFF;
                    border-top: 1px solid #22262e;
                }
                td {
                    background:#FFFFFF;
                    padding:10px;
                    text-align:left;
                    vertical-align:middle;
                    font-weight:300;
                    font-size:13px;
                    border-right: 1px solid #C1C3D1;
                }
                </style>
            </head>
            <body>''' + 'Dear {},<br><br> Your upload report by {} is as follows: <br><br>'.format(self.uploader, str(timestamp)) + '''
                <table>
                <thead>
                    <tr style="border: 1px solid #1b1e24;">
                    <th>Filename</th>
                    <th>Project</th>
                    <th>Generate ID</th>
                    <th>Upload time</th>
                    <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        '''
        html_footer = ''' 
                </tbody>
                </table>
            <br>''' + '\r\n This is an automated message please do not reply. \
                \r\n Should you require assistance please contact <a href="mailto: uploadSuport@vre.com">uploadSuport@vre.com</a>' + '''
            </body>
        </html>
        '''
        html = ''
        for row in self.files:
            html = html + "<tr>"
            html = html + "<td>" + row['fileName'] + "</td>"
            html = html + "<td>" + row['projectName'] + "</td>"
            html = html + "<td>" + row['generateID'] + "</td>"
            html = html + "<td>" + row['uploadedTime'] + "</td>"
            html = html + "<td>" + row['status'] + "</td>"
            html = html + "</tr>"
            html = html + "</table>"

        return html_header + html + html_footer
