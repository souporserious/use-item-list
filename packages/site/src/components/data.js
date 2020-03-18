import faker from 'faker'

function generateFakeData(callback, size = 10) {
  const data = []
  for (let i = 0; i < size; i++) {
    data.push(callback(faker))
  }
  return data
}

export default generateFakeData(faker => ({
  id: faker.random.uuid(),
  avatar: faker.image.avatar(),
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  phoneNumber: faker.phone.phoneNumber(),
  email: faker.internet.email(),
}))
