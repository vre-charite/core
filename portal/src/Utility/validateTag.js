function validateTag(tag) {
  const re = /^[a-z0-9-]{1,32}$/i;
  return re.test(String(tag).toLowerCase());
}

export { validateTag };
