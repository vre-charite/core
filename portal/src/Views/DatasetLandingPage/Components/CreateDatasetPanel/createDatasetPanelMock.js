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
