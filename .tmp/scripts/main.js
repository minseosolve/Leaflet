/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // console.log(registration);
      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  // Custom JS Goes Here
  const postRequestUrl = 'http://minseoalexkim.com/wp-json/wp/v2/posts';
  const tagsRequestUrl = 'http://minseoalexkim.com/wp-json/wp/v2/tags';
  let dataObj = {
    postData: '',
    tagsData: ''
  };

  const fetchData = function(requestUrl, type, dataObj) {
    return new Promise(function(resolve, reject) {
      const request = new XMLHttpRequest();
      request.open('GET', requestUrl);

      request.onload = function() {
        // if status is 200
        if (request.status === 200) {
          // resolve promise with response depending on type of request
          if (type === 'post') {
            dataObj.postData = request.responseText;
          } else {
            dataObj.tagsData = request.responseText;
          }
          resolve(dataObj);
        } else {
          // otherwise reject with status text
          reject(Error(request.statusText));
        }
      };
      // Handling network errors
      request.onerror = function() {
        reject(Error('Network Error!'));
      };
      request.send();
    });
  };

  const processData = function(response) {
    let cleanedDataObj = {
      postData: '',
      tagMap: new Map()
    };

    let tagsData = JSON.parse(response.tagsData);
    let postData = JSON.parse(response.postData);
    // Process post data first
    // Parse JSON data and then filter for book reviews using categories( Category "36")
    let filteredData = postData.filter(function(post) {
      return post.categories[0] === 36;
    });
    // Map only the relevant properties
    const processedPostData = filteredData.map(function(post, index) {
      let contentSplitted = post.content.rendered.split('\n');
      let preview = contentSplitted[0];
      return {
        date: post.date,
        title: post.title.rendered,
        previewText: preview,
        fullContent: post.content.rendered,
        image: post.better_featured_image.source_url,
        tags: post.tags,
        index: index
      };
    });

    // Process tag data
    tagsData.forEach(function(tag) {
      cleanedDataObj.tagMap.set(tag.id, tag.name);
    });

    // Attach processed data to cleaned data object
    cleanedDataObj.postData = processedPostData;
    return cleanedDataObj;
  };

  // const findTagNames = function(dataObj) {
  //   console.log('----finding TAG NAMES-----');
  //   dataObj.postData.forEach(function(review) {
  //     let tagsArray = review.tags;
  //     let tagMap = dataObj.tagMap;
  //     for (let i = 0; i < tagsArray.length; i++) {
  //       tagsArray[i] = tagMap.get(tagsArray[i]);
  //     }
  //   });
  //   console.log(dataObj);
  //   return dataObj;
  // };

  const changeBookCoverBackgroundColor = function() {
    const colors = ['#F36A6F', '#65A3F6', '#9FF6B7', '#FECC48'];
    const bookCoverElems =
    document.getElementsByClassName('review__card__bookCover');
    for (let i = 0; i < bookCoverElems.length; i++) {
      let colorIndex = i % 4;
      bookCoverElems[i].style.backgroundColor = colors[colorIndex];
    }
  };

  const render = function(data) {
    const templateScript = document.getElementById('review-cards').innerHTML;
    const template = Handlebars.compile(templateScript);
    document.getElementById('reviews').innerHTML = template(data);
  };

  /* fetch post data, then filter/process it, and render it */
  fetchData(postRequestUrl, 'post', dataObj)
    .then(fetchData(tagsRequestUrl, 'tags', dataObj))
    .then(processData)
    // .then(findTagNames)
    .then(render)
    .then(changeBookCoverBackgroundColor)
    .catch(function(reason) {
      console.error('Caught error for this :', reason);
    });
})();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gQ2hlY2sgdG8gbWFrZSBzdXJlIHNlcnZpY2Ugd29ya2VycyBhcmUgc3VwcG9ydGVkIGluIHRoZSBjdXJyZW50IGJyb3dzZXIsXG4gIC8vIGFuZCB0aGF0IHRoZSBjdXJyZW50IHBhZ2UgaXMgYWNjZXNzZWQgZnJvbSBhIHNlY3VyZSBvcmlnaW4uIFVzaW5nIGFcbiAgLy8gc2VydmljZSB3b3JrZXIgZnJvbSBhbiBpbnNlY3VyZSBvcmlnaW4gd2lsbCB0cmlnZ2VyIEpTIGNvbnNvbGUgZXJyb3JzLiBTZWVcbiAgLy8gaHR0cDovL3d3dy5jaHJvbWl1bS5vcmcvSG9tZS9jaHJvbWl1bS1zZWN1cml0eS9wcmVmZXItc2VjdXJlLW9yaWdpbnMtZm9yLXBvd2VyZnVsLW5ldy1mZWF0dXJlc1xuICB2YXIgaXNMb2NhbGhvc3QgPSBCb29sZWFuKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PT0gJ2xvY2FsaG9zdCcgfHxcbiAgICAgIC8vIFs6OjFdIGlzIHRoZSBJUHY2IGxvY2FsaG9zdCBhZGRyZXNzLlxuICAgICAgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09PSAnWzo6MV0nIHx8XG4gICAgICAvLyAxMjcuMC4wLjEvOCBpcyBjb25zaWRlcmVkIGxvY2FsaG9zdCBmb3IgSVB2NC5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZS5tYXRjaChcbiAgICAgICAgL14xMjcoPzpcXC4oPzoyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT8pKXszfSQvXG4gICAgICApXG4gICAgKTtcblxuICBpZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvciAmJlxuICAgICAgKHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2h0dHBzOicgfHwgaXNMb2NhbGhvc3QpKSB7XG4gICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJ3NlcnZpY2Utd29ya2VyLmpzJylcbiAgICAudGhlbihmdW5jdGlvbihyZWdpc3RyYXRpb24pIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHJlZ2lzdHJhdGlvbik7XG4gICAgICAvLyB1cGRhdGVmb3VuZCBpcyBmaXJlZCBpZiBzZXJ2aWNlLXdvcmtlci5qcyBjaGFuZ2VzLlxuICAgICAgcmVnaXN0cmF0aW9uLm9udXBkYXRlZm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gdXBkYXRlZm91bmQgaXMgYWxzbyBmaXJlZCB0aGUgdmVyeSBmaXJzdCB0aW1lIHRoZSBTVyBpcyBpbnN0YWxsZWQsXG4gICAgICAgIC8vIGFuZCB0aGVyZSdzIG5vIG5lZWQgdG8gcHJvbXB0IGZvciBhIHJlbG9hZCBhdCB0aGF0IHBvaW50LlxuICAgICAgICAvLyBTbyBjaGVjayBoZXJlIHRvIHNlZSBpZiB0aGUgcGFnZSBpcyBhbHJlYWR5IGNvbnRyb2xsZWQsXG4gICAgICAgIC8vIGkuZS4gd2hldGhlciB0aGVyZSdzIGFuIGV4aXN0aW5nIHNlcnZpY2Ugd29ya2VyLlxuICAgICAgICBpZiAobmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIuY29udHJvbGxlcikge1xuICAgICAgICAgIC8vIFRoZSB1cGRhdGVmb3VuZCBldmVudCBpbXBsaWVzIHRoYXQgcmVnaXN0cmF0aW9uLmluc3RhbGxpbmcgaXMgc2V0OlxuICAgICAgICAgIC8vIGh0dHBzOi8vc2xpZ2h0bHlvZmYuZ2l0aHViLmlvL1NlcnZpY2VXb3JrZXIvc3BlYy9zZXJ2aWNlX3dvcmtlci9pbmRleC5odG1sI3NlcnZpY2Utd29ya2VyLWNvbnRhaW5lci11cGRhdGVmb3VuZC1ldmVudFxuICAgICAgICAgIHZhciBpbnN0YWxsaW5nV29ya2VyID0gcmVnaXN0cmF0aW9uLmluc3RhbGxpbmc7XG5cbiAgICAgICAgICBpbnN0YWxsaW5nV29ya2VyLm9uc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoaW5zdGFsbGluZ1dvcmtlci5zdGF0ZSkge1xuICAgICAgICAgICAgICBjYXNlICdpbnN0YWxsZWQnOlxuICAgICAgICAgICAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIHRoZSBvbGQgY29udGVudCB3aWxsIGhhdmUgYmVlbiBwdXJnZWQgYW5kIHRoZVxuICAgICAgICAgICAgICAgIC8vIGZyZXNoIGNvbnRlbnQgd2lsbCBoYXZlIGJlZW4gYWRkZWQgdG8gdGhlIGNhY2hlLlxuICAgICAgICAgICAgICAgIC8vIEl0J3MgdGhlIHBlcmZlY3QgdGltZSB0byBkaXNwbGF5IGEgXCJOZXcgY29udGVudCBpc1xuICAgICAgICAgICAgICAgIC8vIGF2YWlsYWJsZTsgcGxlYXNlIHJlZnJlc2guXCIgbWVzc2FnZSBpbiB0aGUgcGFnZSdzIGludGVyZmFjZS5cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICBjYXNlICdyZWR1bmRhbnQnOlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGluc3RhbGxpbmcgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzZXJ2aWNlIHdvcmtlciBiZWNhbWUgcmVkdW5kYW50LicpO1xuXG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkdXJpbmcgc2VydmljZSB3b3JrZXIgcmVnaXN0cmF0aW9uOicsIGUpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gQ3VzdG9tIEpTIEdvZXMgSGVyZVxuICBjb25zdCBwb3N0UmVxdWVzdFVybCA9ICdodHRwOi8vbWluc2VvYWxleGtpbS5jb20vd3AtanNvbi93cC92Mi9wb3N0cyc7XG4gIGNvbnN0IHRhZ3NSZXF1ZXN0VXJsID0gJ2h0dHA6Ly9taW5zZW9hbGV4a2ltLmNvbS93cC1qc29uL3dwL3YyL3RhZ3MnO1xuICBsZXQgZGF0YU9iaiA9IHtcbiAgICBwb3N0RGF0YTogJycsXG4gICAgdGFnc0RhdGE6ICcnXG4gIH07XG5cbiAgY29uc3QgZmV0Y2hEYXRhID0gZnVuY3Rpb24ocmVxdWVzdFVybCwgdHlwZSwgZGF0YU9iaikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgcmVxdWVzdFVybCk7XG5cbiAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGlmIHN0YXR1cyBpcyAyMDBcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAvLyByZXNvbHZlIHByb21pc2Ugd2l0aCByZXNwb25zZSBkZXBlbmRpbmcgb24gdHlwZSBvZiByZXF1ZXN0XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdwb3N0Jykge1xuICAgICAgICAgICAgZGF0YU9iai5wb3N0RGF0YSA9IHJlcXVlc3QucmVzcG9uc2VUZXh0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhT2JqLnRhZ3NEYXRhID0gcmVxdWVzdC5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUoZGF0YU9iaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gb3RoZXJ3aXNlIHJlamVjdCB3aXRoIHN0YXR1cyB0ZXh0XG4gICAgICAgICAgcmVqZWN0KEVycm9yKHJlcXVlc3Quc3RhdHVzVGV4dCkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgLy8gSGFuZGxpbmcgbmV0d29yayBlcnJvcnNcbiAgICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QoRXJyb3IoJ05ldHdvcmsgRXJyb3IhJykpO1xuICAgICAgfTtcbiAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IHByb2Nlc3NEYXRhID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICBsZXQgY2xlYW5lZERhdGFPYmogPSB7XG4gICAgICBwb3N0RGF0YTogJycsXG4gICAgICB0YWdNYXA6IG5ldyBNYXAoKVxuICAgIH07XG5cbiAgICBsZXQgdGFnc0RhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnRhZ3NEYXRhKTtcbiAgICBsZXQgcG9zdERhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnBvc3REYXRhKTtcbiAgICAvLyBQcm9jZXNzIHBvc3QgZGF0YSBmaXJzdFxuICAgIC8vIFBhcnNlIEpTT04gZGF0YSBhbmQgdGhlbiBmaWx0ZXIgZm9yIGJvb2sgcmV2aWV3cyB1c2luZyBjYXRlZ29yaWVzKCBDYXRlZ29yeSBcIjM2XCIpXG4gICAgbGV0IGZpbHRlcmVkRGF0YSA9IHBvc3REYXRhLmZpbHRlcihmdW5jdGlvbihwb3N0KSB7XG4gICAgICByZXR1cm4gcG9zdC5jYXRlZ29yaWVzWzBdID09PSAzNjtcbiAgICB9KTtcbiAgICAvLyBNYXAgb25seSB0aGUgcmVsZXZhbnQgcHJvcGVydGllc1xuICAgIGNvbnN0IHByb2Nlc3NlZFBvc3REYXRhID0gZmlsdGVyZWREYXRhLm1hcChmdW5jdGlvbihwb3N0LCBpbmRleCkge1xuICAgICAgbGV0IGNvbnRlbnRTcGxpdHRlZCA9IHBvc3QuY29udGVudC5yZW5kZXJlZC5zcGxpdCgnXFxuJyk7XG4gICAgICBsZXQgcHJldmlldyA9IGNvbnRlbnRTcGxpdHRlZFswXTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGU6IHBvc3QuZGF0ZSxcbiAgICAgICAgdGl0bGU6IHBvc3QudGl0bGUucmVuZGVyZWQsXG4gICAgICAgIHByZXZpZXdUZXh0OiBwcmV2aWV3LFxuICAgICAgICBmdWxsQ29udGVudDogcG9zdC5jb250ZW50LnJlbmRlcmVkLFxuICAgICAgICBpbWFnZTogcG9zdC5iZXR0ZXJfZmVhdHVyZWRfaW1hZ2Uuc291cmNlX3VybCxcbiAgICAgICAgdGFnczogcG9zdC50YWdzLFxuICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvLyBQcm9jZXNzIHRhZyBkYXRhXG4gICAgdGFnc0RhdGEuZm9yRWFjaChmdW5jdGlvbih0YWcpIHtcbiAgICAgIGNsZWFuZWREYXRhT2JqLnRhZ01hcC5zZXQodGFnLmlkLCB0YWcubmFtZSk7XG4gICAgfSk7XG5cbiAgICAvLyBBdHRhY2ggcHJvY2Vzc2VkIGRhdGEgdG8gY2xlYW5lZCBkYXRhIG9iamVjdFxuICAgIGNsZWFuZWREYXRhT2JqLnBvc3REYXRhID0gcHJvY2Vzc2VkUG9zdERhdGE7XG4gICAgcmV0dXJuIGNsZWFuZWREYXRhT2JqO1xuICB9O1xuXG4gIC8vIGNvbnN0IGZpbmRUYWdOYW1lcyA9IGZ1bmN0aW9uKGRhdGFPYmopIHtcbiAgLy8gICBjb25zb2xlLmxvZygnLS0tLWZpbmRpbmcgVEFHIE5BTUVTLS0tLS0nKTtcbiAgLy8gICBkYXRhT2JqLnBvc3REYXRhLmZvckVhY2goZnVuY3Rpb24ocmV2aWV3KSB7XG4gIC8vICAgICBsZXQgdGFnc0FycmF5ID0gcmV2aWV3LnRhZ3M7XG4gIC8vICAgICBsZXQgdGFnTWFwID0gZGF0YU9iai50YWdNYXA7XG4gIC8vICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhZ3NBcnJheS5sZW5ndGg7IGkrKykge1xuICAvLyAgICAgICB0YWdzQXJyYXlbaV0gPSB0YWdNYXAuZ2V0KHRhZ3NBcnJheVtpXSk7XG4gIC8vICAgICB9XG4gIC8vICAgfSk7XG4gIC8vICAgY29uc29sZS5sb2coZGF0YU9iaik7XG4gIC8vICAgcmV0dXJuIGRhdGFPYmo7XG4gIC8vIH07XG5cbiAgY29uc3QgY2hhbmdlQm9va0NvdmVyQmFja2dyb3VuZENvbG9yID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgY29sb3JzID0gWycjRjM2QTZGJywgJyM2NUEzRjYnLCAnIzlGRjZCNycsICcjRkVDQzQ4J107XG4gICAgY29uc3QgYm9va0NvdmVyRWxlbXMgPVxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3Jldmlld19fY2FyZF9fYm9va0NvdmVyJyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib29rQ292ZXJFbGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGNvbG9ySW5kZXggPSBpICUgNDtcbiAgICAgIGJvb2tDb3ZlckVsZW1zW2ldLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbG9yc1tjb2xvckluZGV4XTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgcmVuZGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGNvbnN0IHRlbXBsYXRlU2NyaXB0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jldmlldy1jYXJkcycpLmlubmVySFRNTDtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSh0ZW1wbGF0ZVNjcmlwdCk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jldmlld3MnKS5pbm5lckhUTUwgPSB0ZW1wbGF0ZShkYXRhKTtcbiAgfTtcblxuICAvKiBmZXRjaCBwb3N0IGRhdGEsIHRoZW4gZmlsdGVyL3Byb2Nlc3MgaXQsIGFuZCByZW5kZXIgaXQgKi9cbiAgZmV0Y2hEYXRhKHBvc3RSZXF1ZXN0VXJsLCAncG9zdCcsIGRhdGFPYmopXG4gICAgLnRoZW4oZmV0Y2hEYXRhKHRhZ3NSZXF1ZXN0VXJsLCAndGFncycsIGRhdGFPYmopKVxuICAgIC50aGVuKHByb2Nlc3NEYXRhKVxuICAgIC8vIC50aGVuKGZpbmRUYWdOYW1lcylcbiAgICAudGhlbihyZW5kZXIpXG4gICAgLnRoZW4oY2hhbmdlQm9va0NvdmVyQmFja2dyb3VuZENvbG9yKVxuICAgIC5jYXRjaChmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0NhdWdodCBlcnJvciBmb3IgdGhpcyA6JywgcmVhc29uKTtcbiAgICB9KTtcbn0pKCk7XG4iXSwiZmlsZSI6Im1haW4uanMifQ==
