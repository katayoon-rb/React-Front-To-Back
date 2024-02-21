import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'

import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getStorage, ref, uploadBytesResumable,
        getDownloadURL } from 'firebase/storage'
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'

import Spinner from '../components/Spinner'


function EditListing() {
  // eslint-disable-next-line
  const [geolocationEnabled, setGeolocationEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [listing, setListing] = useState(false)
  const [formData, setFormData] = useState({
    type: 'rent', name: '', bedrooms: 1, bathrooms: 1,
    parking: false, furnished: false, address: '',
    offer: false, regularPrice: 0, discountedPrice: 0,
    images: {}
  })

  const {
    type, name, bedrooms, bathrooms, parking, furnished,
    address, offer, regularPrice, discountedPrice, images
  } = formData

  const auth = getAuth()
  const navigate = useNavigate()
  const params = useParams()
  const isMounted = useRef(true)

  // Redirect if listing is not user's
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error('You can not edit that listing')
      navigate('/')
    }
  })

  // Fetch listing to edit
  useEffect(() => {
    setLoading(true)
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setListing(docSnap.data())
        setFormData({ ...docSnap.data(), address: docSnap.data().location })
        setLoading(false)
      }
      else {
        navigate('/')
        toast.error('Listing does not exist')
      }
    }
    fetchListing()
  }, [params.listingId, navigate])

  // Sets userRef to logged in user
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, user => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid })
        }
        else {
          navigate('/sign-in')
        }
      })
    }
    return () => {
      isMounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  const onSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    if (discountedPrice >= regularPrice) {
      setLoading(false)
      toast.error('Discounted price needs to be less than regular price')
      return
    }

    if (images.length > 6) {
      setLoading(false)
      toast.error('Max 6 images')
      return
    }

    // Store image in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage()
        const storageRef = ref(storage,
          `images/${auth.currentUser.uid}-${image.name}-${uuidv4()}`
        )
        const uploadTask = uploadBytesResumable(storageRef, image)

        uploadTask.on(
          'state_changed',
          snapshot => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log('Upload is ' + progress + '% done')

            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused')
                break

              case 'running':
                console.log('Upload is running')
                break

              default:
                break
            }
          },
          error => { reject(error) },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
              resolve(downloadURL)
            })
          }
        )
      })
    }

    const imgUrls = await Promise.all(
      [...images].map(image => storeImage(image))
    ).catch(() => {
      setLoading(false)
      toast.error('Images not uploaded')
      return
    })

    const formDataCopy = {
      ...formData,
      imgUrls,
      timestamp: serverTimestamp()
    }

    formDataCopy.location = address
    delete formDataCopy.images
    delete formDataCopy.address
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    // Update listing
    const docRef = doc(db, 'listings', params.listingId)
    await updateDoc(docRef, formDataCopy)
    setLoading(false)
    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

  const onMutate = e => {
    let boolean = null

    if (e.target.value === 'true') { boolean = true }
    if (e.target.value === 'false') { boolean = false }

    // Files
    if (e.target.files) {
      setFormData(prevState => ({
        ...prevState,
        images: e.target.files
      }))
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData(prevState => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value
      }))
    }
  }

  if (loading) { return <Spinner /> }
  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Edit Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button id='type' type='button'
              className={
                type === 'sale' ? 'formButtonActive' : 'formButton'
              }
              value='sale'
              onClick={onMutate}
            >Sell</button>
            <button id='type' type='button'
              className={
                type === 'rent' ? 'formButtonActive' : 'formButton'
              }
              value='rent'
              onClick={onMutate}
            >Rent</button>
          </div>

          <label className='formLabel'>Name</label>
          <input id='name' type='text'
            className='formInputName'
            value={name} required
            onChange={onMutate}
            maxLength='32' minLength='10'
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input id='bedrooms' type='number'
                className='formInputSmall'
                value={bedrooms} required
                onChange={onMutate}
                min='1' max='50'
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input id='bathrooms' type='number'
                className='formInputSmall'
                value={bathrooms} required
                onChange={onMutate}
                min='1' max='50'
              />
            </div>
          </div>

          <label className='formLabel'>Parking spot</label>
          <div className='formButtons'>
            <button id='parking' type='button'
              className={parking ? 'formButtonActive' : 'formButton'}
              value={true}
              onClick={onMutate}
              min='1' max='50'
            >Yes</button>
            <button id='parking' type='button'
              className={
                !parking &&
                parking !== null ? 'formButtonActive' : 'formButton'
              }
              value={false}
              onClick={onMutate}
            >No</button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button id='furnished' type='button'
              className={furnished ? 'formButtonActive' : 'formButton'}
              value={true}
              onClick={onMutate}
            >Yes</button>
            <button id='furnished' type='button'
              className={
                !furnished &&
                furnished !== null ? 'formButtonActive' : 'formButton'
              }
              value={false}
              onClick={onMutate}
            >No</button>
          </div>

          <label className='formLabel'>Address</label>
          <textarea id='address' type='text'
            className='formInputAddress'
            value={address} required
            onChange={onMutate}
          />

          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button id='offer' type='button'
              className={offer ? 'formButtonActive' : 'formButton'}
              value={true}
              onClick={onMutate}
            >Yes</button>
            <button id='offer' type='button'
              className={
                !offer &&
                offer !== null ? 'formButtonActive' : 'formButton'
              }
              value={false}
              onClick={onMutate}
            >No</button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input id='regularPrice' type='number'
              className='formInputSmall'
              value={regularPrice} required
              onChange={onMutate}
              min='50' max='750000000'
            />
            {type === 'rent' &&
                <p className='formPriceText'>$ / Month</p>
            }
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input id='discountedPrice' type='number'
                className='formInputSmall'
                value={discountedPrice} required={offer}
                onChange={onMutate}
                min='50' max='750000000'
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input id='images' type='file'
            className='formInputFile'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple  required
          />
          <button type='submit'
            className='primaryButton createListingButton'
          >
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default EditListing
