require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const SNS_API_URL = 'https://open.assembly.go.kr/portal/openapi/nwvrqwxyaytdsfvhu';

async function fetchMemberSns(name) {
  const params = new URLSearchParams({
    Key: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY || '',
    Type: 'json',
    pIndex: '1',
    pSize: '1',
    HG_NM: name
  });

  try {
    const response = await fetch(`${SNS_API_URL}?${params.toString()}`);
    const data = await response.json();
    console.log(`API Response for ${name}:`, data);
    const memberInfo = data?.nwvrqwxyaytdsfvhu?.[1]?.row?.[0];
    
    if (memberInfo) {
      return {
        facebook: memberInfo.FACEBOOK || '',
        twitter: memberInfo.TWITTER || '',
        youtube: memberInfo.YOUTUBE || '',
        instagram: memberInfo.INSTAGRAM || ''
      };
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch SNS info for ${name}:`, error);
    return null;
  }
}

async function updateMemberSns() {
  try {
    const filePath = path.join(__dirname, '../src/data/member22.json');
    const memberData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log('Updating member SNS information...');
    const updatedMembers = [];
    
    for (const member of memberData.members) {
      console.log(`Processing ${member.name}...`);
      const snsInfo = await fetchMemberSns(member.name);
      
      updatedMembers.push({
        ...member,
        sns: snsInfo || {
          facebook: '',
          twitter: '',
          youtube: '',
          instagram: ''
        }
      });

      // API 호출 간 딜레이
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const updatedData = { members: updatedMembers };
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
    console.log('Successfully updated member22.json with SNS information');

  } catch (error) {
    console.error('Failed to update member SNS:', error);
  }
}

updateMemberSns(); 