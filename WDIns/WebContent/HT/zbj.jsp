
<html lang="zh-cn">
<%@ page contentType="text/html;charset=UTF-8"%>
<head>

<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta charset="utf-8">
<meta name="renderer" content="webkit">
<title>需求市场-专业服务商为您服务 -企业需求网</title>

<link type="text/css" rel="stylesheet" href="style/basestyle.css">

   <link type="text/css" rel="stylesheet" href="style/global4oldpage.css">
<link rel="stylesheet" type="text/css" href="style/hall.css">


</head>
<body class="t5s paidan-animation-env">


<table id="gridTable" border="0" cellpadding="1" cellspacing="1" style='border: 1px gray solid; width:95%;'>

	<thead>

		<tr height="27" style="border-color: #E9E9E9 gray;">
			<td class="tdsub1" align=center width=180>CME ApplicationId</td>
			<td class="tdsub1" align=center width=180>CME Application Name</td>
			<td class="tdsub1" align=center width=180>CME Application Desc</td>
			<td class="tdsub1" align=center width=90>Mod User</td>
			<td class="tdsub1" align=center width=90>Mod Date</td>
			<c:if test="${hasUpdateEnt}">
			<td class="tdsub1" align=center colspan=2>&nbsp;</td>
			</c:if>
		</tr>
	</thead>
	
	<c:forEach items="${beanView.apps}" var="resObj">

		

		<tr height="22">

			<td align=center class="black">${resObj.appId}</td>
			<td align=center class="black">${resObj.appName}</td>
			<td align=center class="black">${resObj.appDesc}</td>
			<td align=center class="black">${resObj.modUser}</td>
			<td align=center class="black">
				<fmt:formatDate value="${resObj.modDate}" type="date" pattern="MM/dd/yyyy"></fmt:formatDate>
			</td>
			<c:if test="${hasUpdateEnt}">
			<td align=center class="black"><a href="javascript:editApp('${resObj.appId}')">Edit</a></td>
			<td align=center class="black"><a href="javascript:delApp('${resObj.appId}')">Del</a></td>
			</c:if>
		</tr>

	</c:forEach>
</table>
	


			<a data-linkid="topbar-app-ios" data-process="1" rel="nofollow"
				href="https://itunes.apple.com/cn/app/zhu-ba-jie-wei-ke-gai-bian/id597101749?ls=1&amp;mt=8"
				target="_blank"><img src="style/ios.png" alt="iOS">
			</a>
	
	<br>

	<div class="grid witkey-pub-entry-con">
		<span class="yahei item-txt"></span><a rel="nofollow" target="_blank"
			class="ui-btn ui-btn-inverse"
			href="http://task.zhubajie.com/pub/step1?from_cid=111111">立即发布需求</a>
	</div>
</body>
</html>