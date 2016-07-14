
import { API } from '../middleware/api_call'
import lock from '../services/lock'

export const readCurrentUser = function readCurrentUser (payload) {
  return function (dispatch, getState) {
    if (getState().current_user.loaded) {
      return
    }

    return dispatch({
      [API]: {
        endpoint: 'users/me',
        method: 'GET',
        types: {
          start: { type: 'start read current user' },
          success: 'read current user'
        },
        transformResponse: function transformResponse (response) {
          return response.body
        }
      }
    })
  }
}

export const changeMFAStatus = function changeMFAStatus (payload) {
  return {
    [API]: {
      endpoint: 'users/me/mfa',
      method: 'PATCH',
      types: {
        success: 'change mfa status',
        simulate: {
          type: 'change mfa status',
          payload: payload
        },
        revert: {
          type: 'change mfa status',
          payload: !payload
        }
      },
      data: {
        disable_mfa: !!payload
      },
      transformResponse: function transformResponse (response) {
        return response.body.disable_mfa
      }
    }
  }
}

export const unenrollAsync = function unenrollAsync ({ enrollmentId }) {
  return {
    [API]: {
      endpoint: function getEndpoint () {
        return `users/me/mfa/enrollments/${encodeURIComponent(enrollmentId)}`
      },
      method: 'DELETE',
      types: {
        success: 'delete mfa enrollment'
      },
      transformResponse: function transformResponse () {
        return { enrollmentId }
      }
    }
  }
}

export const enrollDevice = function enrollDevice () {
  return function (dispatch) {
    lock().show(function (profile, idToken, accessCode) {
      return dispatch(readCurrentUser())
    })
  }
}