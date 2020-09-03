from flask import request
from flask_restful import Resource
import requests
import os
import json
from config import ConfigClass


class study_files(Resource):

    def post(self, study_id):
        try:
            # get file info
            resumableIdentifier = request.form.get('resumableIdentifier', default='error', type=str)
            resumableFilename = request.form.get('resumableFilename', default='error', type=str)
            resumableChunkNumber = request.form.get('resumableChunkNumber', default=1, type=int)
            resumableTotalChunks = request.form.get('resumableTotalChunks', type=int)
            tags = json.loads(request.form.get('tags', type=str))
            chunk_data = request.files['file']

            # do the initial check for the first chunk
            if resumableChunkNumber == 1:
                pass

            # make our temp directory
            temp_dir = os.path.join(ConfigClass.TEMP_BASE, resumableIdentifier)
            if not os.path.isdir(temp_dir):
                os.makedirs(temp_dir)

            # save the chunk data
            def get_chunk_name(uploaded_filename, chunk_number):
                return uploaded_filename + "_part_%03d" % chunk_number
            chunk_name = get_chunk_name(resumableFilename, resumableChunkNumber)
            chunk_file = os.path.join(temp_dir, chunk_name)
            chunk_data.save(chunk_file)
            chunk_paths = [
                os.path.join(
                    temp_dir, 
                    get_chunk_name(resumableFilename, x)
                )
                for x in range(1, resumableTotalChunks+1)
            ]
            upload_complete = all([os.path.exists(p) for p in chunk_paths])

            # combine all the chunks to create the final file
            if upload_complete:
                target_file_name = os.path.join(temp_dir, resumableFilename)

                # get the file name
                newFileName = target_file_name

                try:
                    # combine all the chunks to create the final file
                    print(newFileName)
                    with open(newFileName, "ab") as target_file:
                        for p in chunk_paths:
                            print(p)
                            stored_chunk_file_name = p
                            stored_chunk_file = open(stored_chunk_file_name, 'rb')
                            target_file.write(stored_chunk_file.read())
                            stored_chunk_file.close()
                            os.unlink(stored_chunk_file_name)
                    target_file.close()
                except Exception as e:
                    return False, "failed combining file chunks"

                return {'result': 'all chunks received'}, 200

            return {'result': 'OK'}, 200

        except Exception as e:
            return {'result': str(e)}, 403
