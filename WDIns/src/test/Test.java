import java.util.ArrayList;
import java.util.List;

import org.springframework.context.ApplicationContext;

import com.ht.DAO.HTDAO;
import com.ht.DAO.base.ClassEntity;
import com.ht.builder.BeanFacadeUtil;
import com.ht.builder.BeanFactoryContext;
import com.ht.vo.Tiger;


public class Test {

	public static void main(String[] args) {
		
		
		ApplicationContext app  = BeanFactoryContext.getAppContext();
		
		
		HTDAO s = BeanFacadeUtil.getBean(HTDAO.class);
		
		
		Tiger t = new Tiger();
		
		t.setName("TaoTiger");
		
		List<Tiger> res = new ArrayList<Tiger>();
		
		res.add(t);
		
		s.batchSave(res);
		

		List<Tiger> list = s.getSQLQueryResults("select {a.*} from Tiger a", new Object[]{},ClassEntity.createAndAdd("a", Tiger.class));

		

	}

}
