const { createApp } = Vue;
// const modal = document.querySelector('#showModal');
// 1. 將 Bootstrap modal 實體化
// https://getbootstrap.com/docs/5.0/components/modal/#usage
// const myModal = new bootstrap.Modal(modal);

const app = createApp({
    data() {
        return {
            apiUrl : 'https://vue3-course-api.hexschool.io/v2',
            apiPath : 'hedy-api-path',
            products : [],
            // isNew 用於判斷當前 Modal 是新增或編輯 Modal
            isNew : false,
            /*tempProduct: {} 裡面還有 imagesUrl: [] 只是預先定義，避免取值出錯，
            如果確定不會出錯，不寫也可以*/
            tempProduct : {
                imagesUrl: []
            },
            deleteModel : null,
            myModal : null,

        }
    },
    methods: {
        //驗證登入狀態
        checkLogin(){
            const checkLoginUrl = `${this.apiUrl}/api/user/check`;
            axios.post(checkLoginUrl)
             .then(()=>{
                //console.log('驗證成功');
                alert('驗證成功 歡迎光臨 ~');
                this.getProducts();
             })
             .catch((err)=>{
                alert(err.response.data.message);
                window.location = 'login.html';
             })
        },
        //取得產品資料
        getProducts(){
            const getProductsUrl = `${this.apiUrl}/api/${this.apiPath}/admin/products`;
            axios.get(getProductsUrl)
             .then((res)=>{
                this.products = res.data.products;
             })
             .catch((err)=>{
                alert(err.response.data.message);
             })
        },
        //開啟 model，
        /*status 用於判斷當前點擊的是 新增/編輯/刪除 btn
          item 代表的是當前點擊的產品資料*/
        openModal(status, item){
            /* 用 if 判斷，若 status 為 ‘new’
               表示點擊的是新增按鈕，所以清空當前的 tempProduct 內容
               並將 isNew 的值改為 true，最後再開啟 myModal */
            if(status === 'new'){
                this.tempProduct = {
                    imagesUrl : [],
                };
                this.isNew = true;
                // 套用 modal.show() 方法開啟 model
                this.myModal.show();
            }
              /*若 status 為 ‘edit’，表示點擊到編輯按鈕，
                所以使用展開運算子 `…item` 將當前產品資料傳入 tempProduct，
                再將 isNew 的值改為 false，最後開啟 myModal */
            else if(status === 'edit'){
                this.tempProduct = {...item};
                this.isNew = false;
                this.myModal.show();
            }
              /* 若 status 為 ‘delete’，表示點擊到刪除按鈕，
                同樣使用展開運算子將產品資料傳入 tempProduct，
                用意是後續串接刪除 API 時，需要取得該產品的 id，
                最後開啟 deleteModel*/
            else if (status === 'delete'){
                this.tempProduct = {...item};
                this.deleteModel.show();
            }
        },
        // 新增 OR 編輯產品 === 使用者按下確認 btn 的功能
        updateProduct(){
            //編輯產品
           let updateProductUrl = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
           let http = 'put';
           //新增產品
           if (this.isNew){
              updateProductUrl = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
              http = 'post';
           }
           axios[http](updateProductUrl,{ data: this.tempProduct })
            .then((res)=>{
                alert(res.data.message);
                this.getProducts();  // 取得所有產品的函式，重新取得所有產品資料，完成產品更新
                this.myModal.hide(); // 套用 modal.hide() 方法關閉 model
                this.tempProduct = {};
            })
            .catch((err)=>{
                alert(err.response.data.message);
            })
        },
        // 刪除產品
        delProduct(){
            const delProductUrl = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
            axios.delete(delProductUrl)
             .then((res)=>{
                alert(res.data.message);
                this.deleteModel.hide();
                this.getProducts();
             })
             .catch((err)=>{
                alert(err.response.data.message);
             })
        },
        // 關閉 model
        closeModal(){
            // 套用 modal.hide() 方法關閉 model
            this.deleteModel.hide();
           this.myModal.hide();
        },
        /*createImages() 的 imagesUrl = [] 
        是避免在編輯產品時如果沒有 imagesUrl 屬性去執行接下來的 push 而出錯
        push('') 是用來新增一個空的 input 讓使用者可以填寫要新增的圖片網址 */
        createImages(){
            this.tempProduct.imagesUrl = [];
            this.tempProduct.imagesUrl.push('');
        }, 
    },
    // 生命週期，在畫面完全生成之後，再來重新擷取動元素
    mounted() {
            /*this.myModal = new bootstrap.Modal(document.getElementById('myModel'),{
                // 禁止使用者使用 ESC 鍵關閉互動視窗
                keyboard: false,
                // 禁止使用者點擊 modal 以外的地方來關閉視窗，避免資料輸入到一半遺失
                backdrop: 'static'
            });
            deleteModel = new bootstrap.Modal(document.getElementById('deleteModel'),{
                 keyboard: false,
                 backdrop: 'static'
            });*/
            this.myModal = new bootstrap.Modal(this.$refs.myModal,{
                // 禁止使用者使用 ESC 鍵關閉互動視窗
                keyboard: false,
                // 禁止使用者點擊 modal 以外的地方來關閉視窗，避免資料輸入到一半遺失
                backdrop: 'static'
            });
            this.deleteModel = new bootstrap.Modal(this.$refs.deleteModel,{
                keyboard: false,
                backdrop: 'static'
           });
            //mounted 將 token 取出，並直接設定到 axios 的預設內容中，
            //這種寫法可以不用在每次發送請求時重複帶入 token 這段
            // https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie
            const token = document.cookie.replace(/(?:(?:^|.*;\s*)myToken\s*\=\s*([^;]*).*$)|^.*$/,"$1",
              );
             // 夾帶 token 在 header 中，只要加入一次就可以重複使用
            //https://axios-http.com/zh/docs/config_defaults
            axios.defaults.headers.common['Authorization'] = token;
            // 觸發確認是否登入
            this.checkLogin();
    },
});
app.mount('#app');
