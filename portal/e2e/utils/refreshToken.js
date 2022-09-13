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

function waitClickRefresh(it,testTitle,getPage){
    it(testTitle,async ()=>{
        const page = getPage();
        await page.waitForSelector('#refresh_modal_refresh',{timeout:6*60*1000});
        await page.waitForTimeout(6000);
        await page.click('#refresh_modal_refresh');
    })
};

module.exports = {waitClickRefresh}