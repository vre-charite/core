export default function protectedRoutes(type, isLogin, datasetId, permissions,datasetList) {
  let containerId = datasetId;
  isLogin = Boolean(isLogin);
  switch (type) {
    case 'isLogin': {
      if (!isLogin) return isLogin;
      if (containerId && datasetList[0]) {
        let p = datasetList[0]['datasetList'].find((i) => {
          return i.id === parseInt(containerId);
        });
        if (!p) return '404';
      }
      return isLogin;
    }
    case 'unLogin': {
      return !isLogin;
    }
    case 'projectAdmin': {
      if (containerId && permissions) {
        let p = permissions.filter((i) => {
          return i.containerId === parseInt(containerId);
        });
        return p[0] && p[0]['permission'] === 'admin' ? true : '403';
      }
      return true;
    }
    case 'projectMember': {
      if (containerId && permissions) {
        let p = permissions.filter((i) => {
          return i.containerId === parseInt(containerId);
        });
        return (p[0] && p[0]['permission'] === 'admin') ||
          (p[0] && p[0]['permission'])
          ? true
          : '403';
      }
      return true;
    }
    default: {
      return true;
    }
  }
}
