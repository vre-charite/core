const mockUsers = [
  'billy',
  'denny',
  'mark',
  'trump',
  'Timmy Kshlerin',
  'Grant Welch',
  'Mrs. Felipe Hayes',
  'Dr. Julius Yundt',
  'Leland Schmidt',
  'Phillip Koepp',
  'Richard Schroeder',
  'Pedro Kassulke',
  'Inez Heaney',
  'Christina Bosco',
  'Edwin Leannon',
  'Ronnie Stroman',
  'Ernestine Bailey',
  'Ellen Ruecker',
  'Mr. Susie Cummings',
  'Ignacio Keebler',
  'Robyn Pouros',
  'Devin Goldner',
  'Willis Koelpin',
  "Wm O'Reilly",
];
async function mockFetchUserList(username) {
  console.log('fetching based on username: ', username);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!username) {
        resolve([]);
      }
      const res = mockUsers
        .filter((name) => name.toLowerCase().includes(username.toLowerCase()))
        .map((item) => ({ label: item, value: item }));
      resolve(res);
    }, 1000);
  });
}

export { mockFetchUserList };
