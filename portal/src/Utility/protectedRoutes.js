// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

export default function protectedRoutes(
  type,
  isLogin,
  datasetId,
  permissions,
  platformRole,
) {
  let containerId = datasetId;
  isLogin = Boolean(isLogin);

  switch (type) {
    case 'isLogin': {
      if (!isLogin) return isLogin;
      if (containerId && permissions) {
        let p = permissions.find((i) => {
          return i.id === parseInt(containerId);
        });
        if (!p) {
          if (platformRole === 'admin') {
            return '404';
          } else {
            return '403';
          }
        }
      }
      return isLogin;
    }
    case 'unLogin': {
      return !isLogin;
    }
    case 'projectAdmin': {
      if (containerId && permissions) {
        let p = permissions.filter((i) => {
          return i.id === parseInt(containerId);
        });
        return p[0] && p[0]['permission'] === 'admin' ? true : '403';
      }
      return true;
    }
    case 'projectMember': {
      if (containerId && permissions) {
        let p = permissions.filter((i) => {
          return i.id === parseInt(containerId);
        });
        return (p[0] && p[0]['permission'] === 'admin') ||
          (p[0] && p[0]['permission'])
          ? true
          : '403';
      }
      return true;
    }
    case 'projectCollab': {
      if (containerId && permissions) {
        let p = permissions.filter((i) => {
          return i.id === parseInt(containerId);
        });
        return (p[0] && p[0]['permission'] === 'admin') ||
          (p[0] && p[0]['permission'] === 'collaborator')
          ? true
          : '403';
      }
      return true;
    }
    case 'PlatformAdmin': {
      if (platformRole === 'admin') {
        return true;
      } else {
        return '403';
      }
    }
    default: {
      return true;
    }
  }
}
