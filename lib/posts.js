export function getSortedPostsData() {
    const allPostsData = [
        {
            id: 'getting-started-with-faunadb',
            title: 'Getting Started with Faunadb',
            date: '2020-08-14',
        }
    ]
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1
        } else {
            return -1
        }
    })
}

export function getAllPostIds() {
    const ids = ['getting-started-with-faunadb']

    // Returns an array that looks like this:
    // [
    //   {
    //     params: {
    //       id: 'ssg-ssr'
    //     }
    //   },
    //   {
    //     params: {
    //       id: 'pre-rendering'
    //     }
    //   }
    // ]
    return ids.map(id => {
        return {
            params: {
                id,
            }
        }
    })
}

export async function getPostData(id) {
    
    // Combine the data with the id and contentHtml
    return {
      id,
      contentHtml: 'This is just some dummy content',
      title: 'Getting Started with Faunadb',
      date: '2020-08-14',
    }
  }