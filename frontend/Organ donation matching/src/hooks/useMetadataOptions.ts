import { useEffect, useState } from 'react'
import { getMetadataOptions, type MetadataOptions } from '../api/api'

const emptyMetadataOptions: MetadataOptions = {
  hospitals: [], cities: [], blood_groups: [], organs_available: [], organs_needed: [], hla_types: [],
  donor_types: [], infection_statuses: [], organ_conditions: [], urgencies: [], doctor_verified: [],
}

export function useMetadataOptions() {
  const [options, setOptions] = useState<MetadataOptions>(emptyMetadataOptions)
  const [loadingMetadata, setLoadingMetadata] = useState(true)
  const [metadataError, setMetadataError] = useState('')

  useEffect(() => {
    let ignore = false
    getMetadataOptions()
      .then(data => {
        if (!ignore) {
          setOptions(data)
          setMetadataError('')
          setLoadingMetadata(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          setMetadataError('Unable to load options from the authenticated data service. Please refresh after the API is available.')
          setLoadingMetadata(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  return { options, metadataError, loadingMetadata }
}
